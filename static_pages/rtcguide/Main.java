package com.javartcdemo;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.UUID;

import javax.swing.SwingUtilities;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttPersistenceException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.json.JSONArray;
import org.json.JSONObject;

import dev.onvoid.webrtc.CreateSessionDescriptionObserver;
import dev.onvoid.webrtc.PeerConnectionFactory;
import dev.onvoid.webrtc.PeerConnectionObserver;
import dev.onvoid.webrtc.RTCAnswerOptions;
import dev.onvoid.webrtc.RTCConfiguration;
import dev.onvoid.webrtc.RTCDataChannel;
import dev.onvoid.webrtc.RTCDataChannelBuffer;
import dev.onvoid.webrtc.RTCDataChannelInit;
import dev.onvoid.webrtc.RTCDataChannelObserver;
import dev.onvoid.webrtc.RTCDataChannelState;
import dev.onvoid.webrtc.RTCIceCandidate;
import dev.onvoid.webrtc.RTCIceGatheringState;
import dev.onvoid.webrtc.RTCIceServer;
import dev.onvoid.webrtc.RTCOfferOptions;
import dev.onvoid.webrtc.RTCPeerConnection;
import dev.onvoid.webrtc.RTCSdpType;
import dev.onvoid.webrtc.RTCSessionDescription;
import dev.onvoid.webrtc.SetSessionDescriptionObserver;

public class Main {
  private static RTCConfiguration config;
  private static PeerConnectionFactory factory;
  private static RTCPeerConnection peerConnection;
  private static RTCDataChannel gDataChannel;

  private static JSONObject offerJsonObject = new JSONObject();
  private static JSONObject answerJsonObject = new JSONObject();

  private static boolean offerIceFinished = false;
  private static boolean answerFinished = false;

  private static MqttClient client;

  public static void main(String[] args) {

    // Configure ICE servers (STUN/TURN)
    config = new RTCConfiguration();
    RTCIceServer iceServer = new RTCIceServer();
    iceServer.urls.add("stun:stun.l.google.com:19302");
    iceServer.urls.add("stun:stun.l.google.com:19302");
    iceServer.urls.add("stun:stun.l.google.com:5349");
    iceServer.urls.add("stun:stun1.l.google.com:3478");
    iceServer.urls.add("stun:stun1.l.google.com:5349");
    iceServer.urls.add("stun:stun2.l.google.com:19302");
    iceServer.urls.add("stun:stun2.l.google.com:5349");
    iceServer.urls.add("stun:stun3.l.google.com:3478");
    iceServer.urls.add("stun:stun3.l.google.com:5349");
    iceServer.urls.add("stun:stun4.l.google.com:19302");
    iceServer.urls.add("stun:stun4.l.google.com:5349");
    config.iceServers.add(iceServer);

    // Create a peer connection factory
    factory = new PeerConnectionFactory();

    // connect to MQTT broker
    String broker = "tcp://broker.emqx.io:1883";
    String clientId = UUID.randomUUID().toString();
    try {
      client = new MqttClient(broker, clientId, new MemoryPersistence());
      MqttConnectOptions options = new MqttConnectOptions();
      options.setAutomaticReconnect(true);
      options.setCleanSession(true);
      options.setConnectionTimeout(10);
      client.connect(options);
    } catch (MqttException e) {
      e.printStackTrace();
    }

    // Create and show GUI on Event Dispatch Thread
    SwingUtilities.invokeLater(() -> {
      MsgWindow m = new MsgWindow() {
        @Override
        public void onCreateOffer() {
          createOffer(this);
        }

        @Override
        public void onCreateAnswer() {
          createAnswer(this);
        }

        @Override
        public void onConnect() {
          connect(this);
        }

        @Override
        public void onSend() {
          send(this);
        }

        @Override
        public void onAutoConnectInit() {
          autoConnectInit(this);
        }

        @Override
        public void onAutoConnect() {
          autoConnect(this);
        }
      };
      m.setVisible(true);
      m.addWindowListener(new WindowAdapter() {
        @Override
        public void windowClosing(WindowEvent e) {
          if (peerConnection != null) {
            peerConnection.close();
          }
          if (client != null) {
            try {
              client.disconnect();
              client.close();
            } catch (MqttException e1) {
              e1.printStackTrace();
            }
          }
          e.getWindow().dispose();
        }
      });
    });
  }

  protected static void autoConnectInit(MsgWindow window) {
    createOffer(window);

    String connectionId = UUID.randomUUID().toString();

    try {
      window.addMessage("Host init finished, code: " + connectionId);
      window.idFromConnect.setText(connectionId);
      client.subscribe(connectionId + "/get_offer", 2, (topic, msg) -> {
        window.addMessage("got request for offer");
        MqttMessage offerMsg = new MqttMessage(offerJsonObject.toString().getBytes(StandardCharsets.UTF_8));
        offerMsg.setQos(2);
        client.publish(connectionId + "/offer", offerMsg);
      });
      client.subscribe(connectionId + "/answer", 2, (topic, msg) -> {
        window.addMessage("Received answer via MQTT");
        window.answerArea.setText(new String(msg.getPayload(), StandardCharsets.UTF_8));
        connect(window);
      });
    } catch (MqttPersistenceException e) {
      window.addMessage("Error in auto-connect: " + e.getMessage());
      e.printStackTrace();
    } catch (MqttException e) {
      window.addMessage("Error in auto-connect: " + e.getMessage());
      e.printStackTrace();
    }
  }

  protected static void autoConnect(MsgWindow window) {
    String targetConnectionId = window.idToConnect.getText().trim();
    try {
      // need to subscribe first or else the offer might return very fast
      client.subscribe(targetConnectionId + "/offer", 2, (topic, msg) -> {
        window.addMessage("Received offer via MQTT");
        window.offerArea.setText(new String(msg.getPayload(), StandardCharsets.UTF_8));
        createAnswer(window);
      });
      window.addMessage("getting offer");
      MqttMessage reqMsg = new MqttMessage("req".getBytes(StandardCharsets.UTF_8));
      reqMsg.setQos(2);
      client.publish(targetConnectionId + "/get_offer", reqMsg);

    } catch (MqttPersistenceException e) {
      window.addMessage("Error in auto-connect: " + e.getMessage());
      e.printStackTrace();
    } catch (MqttException e) {
      window.addMessage("Error in auto-connect: " + e.getMessage());
      e.printStackTrace();
    }
  }

  protected static void createOffer(MsgWindow window) {
    window.addMessage("Creating offer...");

    // Clear previous
    offerJsonObject.clear();
    offerIceFinished = false;

    // step 1: Create a peer connection with an observer to handle events
    peerConnection = factory.createPeerConnection(config, new PeerConnectionObserver() {
      @Override
      public void onIceCandidate(RTCIceCandidate candidate) {
        // step 5: generate candidates
        window.addMessage("ICE Candidate for offer generated: " + candidate.sdpMid);

        if (!offerJsonObject.has("candidates")) {
          offerJsonObject.put("candidates", new JSONArray());
        }
        JSONArray candidatesJsonArr = offerJsonObject.getJSONArray("candidates");
        JSONObject candidateJsonObj = new JSONObject();
        candidateJsonObj.put("sdpMid", candidate.sdpMid);
        candidateJsonObj.put("sdpMLineIndex", candidate.sdpMLineIndex);
        candidateJsonObj.put("sdp", candidate.sdp);
        candidatesJsonArr.put(candidateJsonObj);

        // Append candidate to offer area
        SwingUtilities.invokeLater(() -> {
          window.offerArea.setText(offerJsonObject.toString());
        });
      }

      @Override
      public void onIceGatheringChange(RTCIceGatheringState state) {
        PeerConnectionObserver.super.onIceGatheringChange(state);
        // step 4.1: GATHERING
        // step 6: COMPLETE
        window.addMessage("ICE Gathering State: " + state);
        if (state == RTCIceGatheringState.COMPLETE) {
          offerIceFinished = true;
        }
      }
    });

    window.addMessage("Peer connection created");

    // step 2: Create a data channel to trigger ICE gathering
    RTCDataChannelInit dataChannelInit = new RTCDataChannelInit();
    gDataChannel = peerConnection.createDataChannel("myDataChannel", dataChannelInit);
    gDataChannel.unregisterObserver();
    gDataChannel.registerObserver(creatDataChannelObserver(gDataChannel, window));
    window.addMessage("Data channel created: " + gDataChannel.getLabel());

    // step 3: Create an offer
    RTCOfferOptions options = new RTCOfferOptions();

    peerConnection.createOffer(options, new CreateSessionDescriptionObserver() {
      @Override
      public void onSuccess(RTCSessionDescription description) {
        window.addMessage("Offer created successfully");
        // step 4: Set local description
        peerConnection.setLocalDescription(description, new SetSessionDescriptionObserver() {
          @Override
          public void onSuccess() {
            // save the SDP first, candidates will be appended as they arrive
            window.addMessage("Local description set - ICE gathering started");
            offerJsonObject.put("sdp", description.sdp);
          }

          @Override
          public void onFailure(String error) {
            window.addMessage("Failed to set local description: " + error);
            System.err.println("Failed to set local description: " + error);
          }
        });
      }

      @Override
      public void onFailure(String error) {
        window.addMessage("Failed to create offer: " + error);
        System.err.println("Failed to create offer: " + error);
      }
    });
  }

  protected static void createAnswer(MsgWindow window) {
    window.addMessage("Creating answer...");

    answerJsonObject.clear();
    answerFinished = false;

    // step 0: Get the offer data from the offer text area
    String offerData = window.offerArea.getText().trim();

    if (offerData.isEmpty()) {
      window.addMessage("Error: Offer text area is empty!");
      return;
    }

    // Parse the offer data
    JSONObject offerJsonObj = new JSONObject(offerData);
    String offerSdp = offerJsonObj.getString("sdp");
    JSONArray candidateJsonArr = offerJsonObj.getJSONArray("candidates");
    ArrayList<RTCIceCandidate> remoteCandidates = new ArrayList<>();

    for (int i = 0; i < candidateJsonArr.length(); i++) {
      JSONObject candidateJsonObj = candidateJsonArr.getJSONObject(i);
      String sdpMid = candidateJsonObj.getString("sdpMid");
      int sdpMLineIndex = candidateJsonObj.getInt("sdpMLineIndex");
      String sdp = candidateJsonObj.getString("sdp");
      RTCIceCandidate candidate = new RTCIceCandidate(sdpMid, sdpMLineIndex, sdp);
      remoteCandidates.add(candidate);
    }

    window.addMessage("Parsed SDP (" + offerSdp.length() + " chars) and " + candidateJsonArr.length() + " candidates");

    // step 1: Create a peer connection with an observer to handle events
    peerConnection = factory.createPeerConnection(config, new PeerConnectionObserver() {
      @Override
      public void onIceCandidate(RTCIceCandidate candidate) {
        // step 6: generate candidates for this peer, the answerer
        window.addMessage("ICE Candidate generated for answer: " + candidate.sdpMid);

        if (!answerJsonObject.has("candidates")) {
          answerJsonObject.put("candidates", new JSONArray());
        }
        JSONArray candidatesJsonArr = answerJsonObject.getJSONArray("candidates");
        JSONObject candidateJsonObj = new JSONObject();
        candidateJsonObj.put("sdpMid", candidate.sdpMid);
        candidateJsonObj.put("sdpMLineIndex", candidate.sdpMLineIndex);
        candidateJsonObj.put("sdp", candidate.sdp);
        candidatesJsonArr.put(candidateJsonObj);

        // Append candidate to offer area
        SwingUtilities.invokeLater(() -> {
          window.answerArea.setText(answerJsonObject.toString());
        });
      }

      @Override
      public void onDataChannel(RTCDataChannel dataChannel) {
        // step 8: recieve data channel, this is after the connect action
        gDataChannel = dataChannel;
        gDataChannel.unregisterObserver();
        gDataChannel.registerObserver(creatDataChannelObserver(gDataChannel, window));
        window.addMessage("Data channel received: " + dataChannel.getLabel());
      }

      @Override
      public void onIceGatheringChange(RTCIceGatheringState state) {
        PeerConnectionObserver.super.onIceGatheringChange(state);
        // step 5.1: GATHERING
        // step 7: COMPLETE
        window.addMessage("ICE Gathering State: " + state);

        if (state == RTCIceGatheringState.COMPLETE) {
          answerFinished = true;
          String targetConnectionId = window.idToConnect.getText().trim();
          try {
            // System.out.println(answerJsonObject.toString());
            MqttMessage answerMsg = new MqttMessage(answerJsonObject.toString().getBytes(StandardCharsets.UTF_8));
            answerMsg.setQos(2);
            client.publish(targetConnectionId + "/answer", answerMsg);
          } catch (MqttException e) {
            e.printStackTrace();
          }
        }
      }
    });

    window.addMessage("Peer connection created for answer");

    // also step 0: parsing the offer then Create RTCSessionDescription from the
    // offer
    RTCSessionDescription offerDescription = new RTCSessionDescription(RTCSdpType.OFFER, offerSdp);

    // step 2: Set the remote description (the offer)
    peerConnection.setRemoteDescription(offerDescription, new SetSessionDescriptionObserver() {
      @Override
      public void onSuccess() {
        window.addMessage("Remote description (offer) set successfully");

        // step 3: Add all the remote ICE candidates that the offer created
        for (RTCIceCandidate candidate : remoteCandidates) {
          peerConnection.addIceCandidate(candidate);
          window.addMessage("Added remote ICE candidate: " + candidate.sdpMid);
        }

        // step 4: Create an answer
        peerConnection.createAnswer(new RTCAnswerOptions(), new CreateSessionDescriptionObserver() {
          @Override
          public void onSuccess(RTCSessionDescription answerDescription) {
            window.addMessage("Answer created successfully");

            // step 5: Set local description (the answer)
            peerConnection.setLocalDescription(answerDescription, new SetSessionDescriptionObserver() {
              @Override
              public void onSuccess() {
                window.addMessage("Local description (answer) set - ICE gathering started");

                // Display the answer in the answer text area
                answerJsonObject.put("sdp", answerDescription.sdp);
              }

              @Override
              public void onFailure(String error) {
                window.addMessage("Failed to set local description (answer): " + error);
                System.err.println("Failed to set local description: " + error);
              }
            });
          }

          @Override
          public void onFailure(String error) {
            window.addMessage("Failed to create answer: " + error);
            System.err.println("Failed to create answer: " + error);
          }
        });
      }

      @Override
      public void onFailure(String error) {
        window.addMessage("Failed to set remote description: " + error);
        System.err.println("Failed to set remote description: " + error);
      }
    });
  }

  protected static void connect(MsgWindow window) {
    if (peerConnection == null) {
      window.addMessage("Peer connection not initialized.");
      return;
    }

    // parse the returned answer data
    JSONObject answerJsonObj = new JSONObject(window.answerArea.getText().trim());
    String answerSdp = answerJsonObj.getString("sdp");
    JSONArray candidateJsonArr = answerJsonObj.getJSONArray("candidates");
    ArrayList<RTCIceCandidate> remoteCandidates = new ArrayList<>();

    for (int i = 0; i < candidateJsonArr.length(); i++) {
      JSONObject candidateJsonObj = candidateJsonArr.getJSONObject(i);
      String sdpMid = candidateJsonObj.getString("sdpMid");
      int sdpMLineIndex = candidateJsonObj.getInt("sdpMLineIndex");
      String sdp = candidateJsonObj.getString("sdp");
      RTCIceCandidate candidate = new RTCIceCandidate(sdpMid, sdpMLineIndex, sdp);
      remoteCandidates.add(candidate);
      window.addMessage("Parsed ICE candidate: " + candidate.sdpMid);
    }

    window.addMessage("Parsed SDP (" + answerSdp.length() + " chars) and " + candidateJsonArr.length() + " candidates");

    RTCSessionDescription answerDescription = new RTCSessionDescription(RTCSdpType.ANSWER, answerSdp);
    peerConnection.setRemoteDescription(answerDescription, new SetSessionDescriptionObserver() {
      @Override
      public void onSuccess() {
        window.addMessage("Remote description (answer) set successfully");

        // Add all the remote ICE candidates
        for (RTCIceCandidate candidate : remoteCandidates) {
          peerConnection.addIceCandidate(candidate);
          window.addMessage("Added remote ICE candidate: " + candidate.sdpMid);
        }
      }

      @Override
      public void onFailure(String error) {
        window.addMessage("Failed to set remote description (answer): " + error);
        System.err.println("Failed to set remote description: " + error);
      }
    });
  }

  protected static void send(MsgWindow window) {
    if (gDataChannel != null && gDataChannel.getState() == RTCDataChannelState.OPEN) {
      String message = window.messageToSendArea.getText().trim();
      ByteBuffer messaBuffer = ByteBuffer.wrap(message.getBytes(StandardCharsets.UTF_8));
      RTCDataChannelBuffer messagDataChannelBuffer = new RTCDataChannelBuffer(messaBuffer, false);
      try {
        gDataChannel.send(messagDataChannelBuffer);
        window.addMessage("Sent message over data channel: " + message);
      } catch (Exception e) {
        window.addMessage("Failed to send message over data channel: " + e.getMessage());
      }
    } else {
      window.addMessage("Data channel is not open. Cannot send message.");
    }
  }

  protected static RTCDataChannelObserver creatDataChannelObserver(RTCDataChannel channel, MsgWindow window) {
    return new RTCDataChannelObserver() {

      @Override
      public void onBufferedAmountChange(long previousAmount) {
        window.addMessage(previousAmount + " " + channel.getBufferedAmount());
      }

      @Override
      public void onStateChange() {
        // last step for both: when this is OPEN, the connection is established
        window.addMessage("Data channel state changed " + channel.getState());
      }

      @Override
      public void onMessage(RTCDataChannelBuffer buffer) {
        ByteBuffer data = buffer.data;
        byte[] textBytes;

        if (data.hasArray()) {
          textBytes = data.array();
        } else {
          textBytes = new byte[data.remaining()];
          data.get(textBytes);
        }

        String message = new String(textBytes, StandardCharsets.UTF_8);
        window.addMessage("Received message over data channel: " + message);
      }

    };
  }
}
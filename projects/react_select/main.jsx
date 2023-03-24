const useState = React.useState;

function App() {
  // stores all the state of the buttons
  const [selected, setSelected] = useState(Array(10).fill(false));

  // render the buttons, pass the set function in
  return (
    <div className="App">
      {selected.map((elem, i) => (
        <Child isSel={elem} k={i} setFn={setSelected} key={i} />
      ))}
      <button onClick={() => setSelected(arr => arr.slice().fill(false))}>
        Clear select
      </button>
    </div>
  );
}

function Child({ isSel, k, setFn }) {
  
  const handleClick = () => {
    // when clicked: if clicking on the same one, nothing
    // else: fill the states to false, set the element at k
    // to true
    setFn((arr) => {
      if (arr[k]) return arr;
      return arr
        .slice()
        .fill(false)
        .fill(!arr[k], k, k + 1);
    });
  };

  return (
    <div className={"btns" + (isSel ? ' btnsSel' : '')} onClick={handleClick}>
      button {k}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

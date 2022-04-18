//simple jsx return
function A(){
  return (
    <h1 className="heading">My Web Portfolio, Upgraded!</h1>
  )
}

// this is each of the nav button section. the button text and the dialog it sould open is 
// passed in as a prop (an object with key=attribute value=attribute value)
// so we can destructure them to individual variables
// the useState function sets the state of an variable and rerenders the component (this function)
// it needs an initial value, and it returns a variable and a function
// the set... can be called with an event to trigger rerender (button click)
// the onMouseEnter triggers the element to change a class name, so it can get a hover style
// I think because the css hover rerenders and react prevents that, so it wont work
// then using a tenary conditional to set the text, if at 0 then show the unviewed message
// since you cannot use if statements in a return
function Nav(props){
  const [visitedCount, setVisitedCount] = React.useState(0);
  const [style, setStyle] = React.useState('btn');
  const {btnName, dialogName} = props;
  
  const handleVisit = ()=> {
    setVisitedCount(number => number+1);
    document.querySelector(`#${dialogName}`).showModal()
  };

  const handleHover = ()=>{
    if(style=="btn") setStyle(s => s="btn-hover");
    else setStyle(s => s="btn");
  }

  return(
    <div className="navElement">
      <button className={style} onClick={handleVisit} onMouseEnter={handleHover} onMouseLeave={handleHover}>{btnName}</button>
      <span className="count">
        {visitedCount==0 ? <pre>View Me</pre>: `You viewed: ${visitedCount} times`}
      </span>
    </div>
  );
}


function Head(){
  return (
    <div>
      <A />
      <div id="allNavSections">
        <Nav btnName="About Me" dialogName="aboutme" />
        <Nav btnName="Projects" dialogName="projects"/>
        <Nav btnName="Contact" dialogName="contact"/>
      </div>
    </div>
  )
}

//insert everything into the div with id of root
const domContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(Head), domContainer)

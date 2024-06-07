import logo from "./logo.svg";
import "./App.css";
import { useCommonContext } from "./context";

function App() {
	const comm = useCommonContext();

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>

				<div>
					<button onClick={() => comm.increment()}>Inc</button>
					<p>{comm.state.count}</p>
					<button onClick={() => comm.decrement()}>Dec</button>
				</div>
			</header>
		</div>
	);
}

export default App;

import "./App.css";

export default function App() {
  return (
    <div className="container">
      <div className="box-linear" data-testid="box-linear" />
      <div className="box-radial" data-testid="box-radial" />
      <div className="box-conic" data-testid="box-conic" />
      <div className="box-plain" data-testid="box-plain" />
    </div>
  );
}

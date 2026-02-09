import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App({ children }) {
  return (
    <div className="App min-h-screen " style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default App;

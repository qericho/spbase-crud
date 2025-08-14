import Crud from "./Crud";
import { ThemeProvider } from "./context/ThemeContext";
const App = () => {
  return (
    <>
      <ThemeProvider>
        <Crud />
      </ThemeProvider>
    </>
  );
};

export default App;

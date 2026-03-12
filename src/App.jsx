import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import "./styles/globals.css";
import "./styles/variables.css";

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;

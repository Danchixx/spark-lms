import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { AdminCourseProvider } from "./context/AdminCourseContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./routes/AppRouter";
import "./styles/globals.css";
import "./styles/variables.css";
import { supabase } from './lib/supabase'

const App = () => {

  // Temporary test — remove after confirming connection
  const testConnection = async () => {
    const { data, error } = await supabase.from('roles').select('*')
    console.log(data, error)
  }
  testConnection()

  return (
    <AuthProvider>
      <ThemeProvider>
        <CourseProvider>
          <AdminCourseProvider>
            <AppRouter />
          </AdminCourseProvider>
        </CourseProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
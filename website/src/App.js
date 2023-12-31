import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { UserContext } from "./userContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import AdminPanel from "./pages/AdminPanel";
import Home from "./pages/Home";
import StudentWork from "./pages/StudentWork";
import Bars from "./pages/Bars";
import Restaurants from "./pages/Restaurants";
import Events from "./pages/Events";
import Wifis from "./pages/Wifis";
import Dorms from "./pages/Dorms";
import Faculties from "./pages/Faculties";
import WifiDetails from "./pages/WifiDetails";
function App() {

  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }


  return (
    <BrowserRouter>
      <UserContext.Provider value={{
        user: user,
        setUserContext: updateUserData
      }}>
        <div className="App">
          <Header title="My application"></Header>



          <Routes>
            <Route path="/" exact element={<Home />}></Route>
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            <Route path="/admin" element={<AdminPanel />}></Route>
            <Route path="/studentWork" element={<StudentWork />}></Route>
            <Route path="/bars" element={<Bars />}></Route>
            <Route path="/restaurants" element={<Restaurants />}></Route>
            <Route path="/events" element={<Events />}></Route>
            <Route path="/wifis" element={<Wifis />}></Route>
            <Route path="/dorms" element={<Dorms />}></Route>
            <Route path="/faculties" element={<Faculties />}></Route>
            <Route path="/wifiDetails/:id" element={<WifiDetails />}></Route>
          </Routes>

        </div>

      </UserContext.Provider>
    </BrowserRouter >
  );
}

export default App;

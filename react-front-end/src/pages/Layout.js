import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    const myFunction = () => {
        var x = document.getElementById("demo");
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
        } else {
            x.className = x.className.replace(" w3-show", "");
        }
    }

    return (
        <>
            <div className="w3-bar w3-black">
                <Link to="/" className="w3-bar-item w3-button w3-hide-small">Heroes</Link>
                <Link to="/roles" className="w3-bar-item w3-button w3-hide-small">Roles</Link>
                <a href="#" className="w3-bar-item w3-button w3-right w3-hide-large w3-hide-medium" onClick={myFunction}>&#9776;</a>
            </div>

            <div id="demo" className="w3-bar-block w3-black w3-hide w3-hide-large w3-hide-medium">
                <Link to="/" className="w3-bar-item w3-button">Heroes</Link>
                <Link to="/roles" className="w3-bar-item w3-button">Roles</Link>
            </div>
            <div className="outlet">
            <Outlet />
            </div>
        </>
    )
};

export default Layout;
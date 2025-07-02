import { Outlet, Link, useLocation } from "react-router-dom";

const Layout = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const myFunction = () => {
        var x = document.getElementById("demo");
        if (x.className.indexOf("w3-show") === -1) {
            x.className += " w3-show";
        } else {
            x.className = x.className.replace(" w3-show", "");
        }
    };

    return (
        <>
            <div className="w3-bar w3-black">
                <Link
                    to="/"
                    className={`w3-bar-item w3-button w3-hide-small${isActive("/") ? " w3-blue" : ""}`}
                >
                    Heroes
                </Link>
                <Link
                    to="/roles"
                    className={`w3-bar-item w3-button w3-hide-small${isActive("/roles") ? " w3-blue" : ""}`}
                >
                    Roles
                </Link>
                <button
                    className="w3-bar-item w3-button w3-right w3-hide-large w3-hide-medium"
                    onClick={myFunction}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                    &#9776;
                </button>
            </div>

            <div id="demo" className="w3-bar-block w3-black w3-hide w3-hide-large w3-hide-medium">
                <Link
                    to="/"
                    className={`w3-bar-item w3-button${isActive("/") ? " w3-blue" : ""}`}
                >
                    Heroes
                </Link>
                <Link
                    to="/roles"
                    className={`w3-bar-item w3-button${isActive("/roles") ? " w3-blue" : ""}`}
                >
                    Roles
                </Link>
            </div>
            <div className="outlet">
                <Outlet />
            </div>
        </>
    );
};

export default Layout;
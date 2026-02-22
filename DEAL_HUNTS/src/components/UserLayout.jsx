import React from "react";

function Layout({title,children}){
    return (
        <div className = "container">
        <div className = "form-box"> 
            {/*it represents both the login and register pages */ }
        <h1>{title}</h1>
        {children}
        </div>
        </div>
    );
}

export default Layout;
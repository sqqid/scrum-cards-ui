import React from "react";
import './Footer.css'
import Picker from "./picker/Picker";

const Footer: React.FC = () => {
   return (
       <div className="footer">
           <span>Choose your card:</span>
           <Picker/>
       </div>
   )
}

export default Footer
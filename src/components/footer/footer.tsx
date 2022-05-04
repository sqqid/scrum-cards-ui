import {FC} from "react";
import './footer.css'
import Picker from "./picker/picker";

const Footer: FC = () => {
   return (
       <div className="footer">
           <span>Choose your card:</span>
           <Picker/>
       </div>
   )
}

export default Footer
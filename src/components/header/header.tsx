import {FC, useContext} from "react";
import './header.css'
import {THEME, ThemeContext} from "../contexts/theme-context";
import {ClientContext} from "../contexts/client-context";
import MoonSvg from "./svg/moon-svg";
import SunSvg from "./svg/sun-svg";
import DownArrow from "./svg/down-arrow";
import Modal from "../modal/modal";
import {ModalContext} from "../contexts/modal-context";

const Header:  FC = () => {
    const modalContext = useContext(ModalContext)
    const themeContext = useContext(ThemeContext)
    const clientContext = useContext(ClientContext)

    const visibleToggle = () => {
        if (modalContext && modalContext.setVisible) {
            modalContext.visible? modalContext.setVisible(false) : modalContext.setVisible(true)
        }
    }

    return (
        <div className="header">
            <Modal/>
            <div className="header__left">
                <span>Scrum Cards</span>
            </div>
            <div className="headr__right">
                <button className="btn"
                        onClick={() => themeContext.toggleTheme()}>
                    <span className="btn__span btn__span--header">
                        {themeContext.theme === THEME.LIGHT ? <MoonSvg/> : <SunSvg/>}
                    </span>
                </button>
                <button className="btn"
                        onClick={visibleToggle}>
                    <span className="btn__span btn__span--header">{clientContext.name}</span>
                    <DownArrow/>
                </button>
            </div>
        </div>
    )
}

export default Header
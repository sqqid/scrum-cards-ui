import {FC, useContext, useState} from "react";
import './header.css'
import Modal from "../modal/modal";
import {THEME, ThemeContext} from "../contexts/theme-context";
import {ClientContext} from "../contexts/client-context";
import MoonSvg from "./svg/moon-svg";
import SunSvg from "./svg/sun-svg";
import DownArrow from "./svg/down-arrow";

const Header: FC = () => {
    const [modalVisiible, setModalVisible] = useState<boolean>(false);
    const visibleToggle = () => modalVisiible ? setModalVisible(false) : setModalVisible(true)
    const themeContext = useContext(ThemeContext)
    const clientContext = useContext(ClientContext)

    return (
        <div className="header">
            <Modal visible={modalVisiible} setVisible={setModalVisible}/>
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
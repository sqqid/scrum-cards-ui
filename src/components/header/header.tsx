import {FC, useContext, useState} from "react";
import './header.css'
import Modal from "../modal/modal";
import {ThemeContext} from "../contexts/theme-context";
import {ClientContext} from "../contexts/client-context";

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
                    <span className="btn__span btn__span--header">Light</span>
                </button>
                <button className="btn"
                        onClick={visibleToggle}>
                    <span className="btn__span btn__span--header">{clientContext.name}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path className="btn__path" d="M2.66699 5.33329L7.84794 10.6666L13.3337 5.33329"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default Header
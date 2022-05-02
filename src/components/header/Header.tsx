import React from "react";
import './Header.css'

const Header: React.FC = () => {
    return (
        <div className="header">
            <div className="header__left">
                <span>Scrum Cards</span>
            </div>
            <div className="headr__right">
                <button className="btn">
                    <span className="btn__span btn__span--header">Light</span>
                </button>
                <button className="btn">
                    <span className="btn__span btn__span--header">Marcin J</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path className="btn__path" d="M2.66699 5.33329L7.84794 10.6666L13.3337 5.33329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default Header
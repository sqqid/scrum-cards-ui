import React from "react";
import './Content.css';
import Table from "./table/Table";

const Content: React.FC = () => {
    return (
        <div className="content">
            <div className="content__controls">
                {/*<span>Pick your cards!</span>*/}
                {/*<button className="btn">*/}
                {/*    <span className="btn__span btn__span--controls">Start new voting</span>*/}
                {/*</button>*/}
                <button className="btn">
                    <span className="btn__span btn__span--controls">Reveal cards</span>
                </button>
            </div>
            <Table/>
        </div>
    )
}

export default Content
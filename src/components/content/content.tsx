import {FC} from "react";
import './content.css';
import Table from "./table/table";

const Content: FC = () => {
    return (
        <div className="content">
            <div className="content__top">
                <div className="content__controls">
                    {/*<span>Pick your cards!</span>*/}
                    {/*<button className="btn">*/}
                    {/*    <span className="btn__span btn__span--controls">Start new voting</span>*/}
                    {/*</button>*/}
                    <button className="btn">
                        <span className="btn__span btn__span--controls">Reveal cards</span>
                    </button>
                </div>
            </div>
            <div className="content__bottom">
                <Table/>
            </div>
        </div>
    );
}

export default Content
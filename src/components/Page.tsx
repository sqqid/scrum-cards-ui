import React from 'react';
import './Page.css';
import Header from "./header/Header";
import Content from "./content/Content";
import Footer from "./footer/Footer";

const Page: React.FC = () => {
    return (
        <div className="container">
            <Header/>
            <Content/>
            <Footer/>
        </div>
    );
}

export default Page;

import {FC} from "react";
import './page.css';
import Header from "./header/header";
import Content from "./content/content";
import Footer from "./footer/footer";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Modal from "./modal/modal";
import {ThemeProvider} from "./contexts/theme-context";
import {ClientProvider} from "./contexts/client-context";

const Page: FC = () => {

    return (
        <BrowserRouter>
            <div className="container">
                <ClientProvider>
                    <Routes>
                        <Route path="sc/" element={<Modal visible={true} setVisible={undefined}/>}/>
                        <Route path="sc/:room_id" element={<>
                            <ThemeProvider>
                                <Header/>
                            </ThemeProvider>
                            <Content/>
                            <Footer/>
                        </>}/>
                    </Routes>
                </ClientProvider>
            </div>
        </BrowserRouter>
    );
}

export default Page;

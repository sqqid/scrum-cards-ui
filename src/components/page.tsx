import {FC, useContext} from "react";
import './page.css';
import Header from "./header/header";
import Content from "./content/content";
import Footer from "./footer/footer";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Modal from "./modal/modal";
import {ThemeProvider} from "./contexts/theme-context";
import {RoomStateProvider} from "./contexts/room-context";
import {ModalContextProvider} from "./contexts/modal-context";
import {ClientContext} from "./contexts/client-context";

const Page: FC = () => {
    const clientContext = useContext(ClientContext)

    return (
        <ThemeProvider>
            <BrowserRouter>
                <div className="container">
                    <Routes>
                        <Route path="sc/" element={<Modal/>}/>
                        <Route path="sc/:room_id" element={
                            <RoomStateProvider>
                                <ModalContextProvider>
                                    <Header/>
                                    <Content/>
                                    {
                                        clientContext.id ? <Footer/> : null
                                    }
                                </ModalContextProvider>
                            </RoomStateProvider>
                        }/>
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default Page;

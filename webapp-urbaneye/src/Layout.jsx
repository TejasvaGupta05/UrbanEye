import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Layout = () => {
    return (
        <div className="layout">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

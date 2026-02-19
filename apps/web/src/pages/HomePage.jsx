import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const HomePage = () => {
  return <div className="flex">
    <Sidebar/>
    <div className="w-full space-y-6 px-8 py-16">
       <Header subtitle="Dashboard" title="Dashboard" />
    </div>
  </div>
}

export default HomePage;

import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/PageShell.css";


export default function PageShell({
  active,
  cartCount = 0,
  wishlistCount = 0,
  children,
}) {
  return (
    <div className="dh-shell">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="dh-shell__main">
        {/* HEADER */}
        <Header
          active={active}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />

        {/* PAGE CONTENT */}
        <main className="dh-shell__content">
          {children}
        </main>
      </div>
    </div>
  );
}
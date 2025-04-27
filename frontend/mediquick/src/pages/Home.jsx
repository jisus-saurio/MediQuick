import React from 'react';
import '../style/home.css'; // Importar el CSS externo


function Home() {
    return (
      <div className="home-container">
        <section className="banner"></section>
  
        <section className="icons">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </section>
  
        <section className="cards">
          <div className="card"></div>
          <div className="card"></div>
          <div className="card"></div>
        </section>
      </div>
    );
  }
export default Home;

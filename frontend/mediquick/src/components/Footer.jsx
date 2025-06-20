import React from 'react';

// Footer componente
function Footer() {
  const footerStyles = {
    container: {
      backgroundColor: '#ED6E26',
      padding: '30px 20px',
      textAlign: 'center',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '10px',
    },
    description: {
      fontSize: '14px',
      color: '#FFFFFF',
      marginBottom: '15px',
      maxWidth: '600px',
      margin: '0 auto 20px',
    },
    socialIcons: {
      fontSize: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
    },
    iconLink: {
      textDecoration: 'none',
      color: '#333',
      fontSize: '24px',
    },
  };

  // Renderiza el footer
  return (
    <footer style={footerStyles.container}>
      <div style={footerStyles.title}>MediQuick - Tu farmacia en línea</div>
      <p style={footerStyles.description}>
        En MediQuick nos preocupamos por tu bienestar. Compra medicinas desde casa con seguridad, confianza y entrega rápida.
      </p>
      <div style={footerStyles.socialIcons}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={footerStyles.iconLink}>
          📘
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={footerStyles.iconLink}>
          🐦
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={footerStyles.iconLink}>
          📸
        </a>
      </div>
    </footer>
  );
}

export default Footer;


import React, { useEffect, useState } from 'react';
import { Box, Heading, Text } from '@primer/react';
import logo from '../assets/query-pilot-logo.png'; // Assuming logo exists here based on Sidebar import

const LoginView = ({ onAuth }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100vh"
            sx={{
                background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background decorative elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(31,111,235,0.15) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    zIndex: 0
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '700px',
                    height: '700px',
                    background: 'radial-gradient(circle, rgba(88,166,255,0.1) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    zIndex: 0
                }}
            />

            <Box
                sx={{
                    textAlign: 'center',
                    p: 5,
                    borderRadius: '24px',
                    backdropFilter: 'blur(20px)',
                    bg: 'rgba(22, 27, 34, 0.6)',
                    border: '1px solid rgba(48, 54, 61, 0.5)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '420px',
                    width: '100%',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    zIndex: 1
                }}
            >
                <Box
                    mb={4}
                    sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        animation: visible ? 'float 6s ease-in-out infinite' : 'none',
                        '@keyframes float': {
                            '0%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                            '100%': { transform: 'translateY(0px)' }
                        }
                    }}
                >
                    <img src={logo} alt="Query Pilot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>

                <Heading sx={{ mb: 2, fontSize: 5, fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Welcome
                </Heading>

                <Text sx={{ mb: 5, color: '#8b949e', display: 'block', fontSize: 2, lineHeight: 1.5 }}>
                    Experience the future of email.
                    <br />
                    Simple, fast, and intelligent.
                </Text>

                <button
                    onClick={onAuth}
                    style={{
                        background: 'linear-gradient(90deg, #1f6feb 0%, #58a6ff 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '16px 40px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        width: 'auto',
                        minWidth: '200px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 20px -5px rgba(31, 111, 235, 0.5)',
                        letterSpacing: '0.5px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(31, 111, 235, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(31, 111, 235, 0.5)';
                    }}
                >
                    Get Started
                </button>
            </Box>
        </Box>
    )

}

export default LoginView

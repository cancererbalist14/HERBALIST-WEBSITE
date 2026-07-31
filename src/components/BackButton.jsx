import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide Back button on Home page and Admin dashboard pages
  const isHidden = 
    location.pathname === '/' || 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/admin-login');

  if (isHidden) return null;

  return (
    <>
      <button 
        onClick={() => navigate(-1)}
        className="global-back-btn"
        title="Go to previous page"
      >
        <FaChevronLeft className="back-btn-icon" />
        <span>Back</span>
      </button>

      <style>{`
        .global-back-btn {
          position: fixed;
          top: 92px;
          left: 24px;
          height: 38px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 50px;
          color: #334155;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          z-index: 996;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .back-btn-icon {
          font-size: 11px;
          transition: transform 0.25s ease;
        }

        .global-back-btn:hover {
          background: #ffffff;
          color: #1a6e52; /* Primary Green color */
          border-color: rgba(26, 110, 82, 0.25);
          box-shadow: 0 6px 20px rgba(26, 110, 82, 0.12);
          transform: translateY(-1px);
        }

        .global-back-btn:hover .back-btn-icon {
          transform: translateX(-3px);
        }

        .global-back-btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(26, 110, 82, 0.08);
        }

        @media (max-width: 768px) {
          .global-back-btn {
            top: 86px;
            left: 16px;
            height: 34px;
            padding: 0 12px;
            font-size: 12.5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          }
        }
      `}</style>
    </>
  );
}

import React, { useState } from 'react';
import './Contact.css';
import emailjs from 'emailjs-com';
import { toast } from 'react-toastify';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: 'service_k45hwgn',
      template_id: 'template_pc169aq',
      user_id: 'l0ZVdqY2OPJBWxQX4', // aka 'user_xxxxx'
      template_params: {
        name: form.name,
        email: form.email,
        message: form.message
      }
    })
  })
    .then((res) => {
      if (res.ok) {
        toast.success('Message sent!');
        setForm({ name: '', email: '', message: '' });
      } else {
        return res.text().then(text => {
          throw new Error(text);
        });
      }
    })
    .catch((err) => {
      console.error('Failed to send email:', err.message);
      toast.error('Failed to send email. Please check your EmailJS configuration.');
    });
};

  return (
    <div className="get-in-touch-container">
      <div className="form-card">
        <h1 className="form-title">Get in Touch</h1>
        <p className="form-subtitle">We’d love to hear from you. Fill out the form or chat with us instantly!</p>

        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit" className="submit-button">Send Message</button>
        </form>

        <div className="chat-section">
          <p>Need a quicker response?</p>
          <button
            className="chat-button"
            onClick={() => toast.success('Call to this cutomer care number 6394529807')}
          >
            Call Our Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;

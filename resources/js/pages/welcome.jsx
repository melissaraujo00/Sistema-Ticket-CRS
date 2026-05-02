import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Header from '@/components/welcome/Header';
import Hero from '@/components/welcome/Hero';
import ContactSection from '@/components/welcome/ContactSection';
import FaqSection from '@/components/welcome/FaqSection';
import Footer from '@/components/welcome/Footer';

export default function Welcome() {
    const { auth, knowledges } = usePage().props;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <Head title="Centro de Ayuda" />
            <Header auth={auth} />
            <Hero />
            <ContactSection />
            <FaqSection knowledges={knowledges} />
            <Footer />
        </div>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Layers,
    Users,
    BarChart3,
    Zap,
    Mail,
    MessageSquare,
    Globe,
    AlertCircle
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import clsx from 'clsx';
import projectPortal from '../assets/project portal.png';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-8 bg-[#e8eae3] rounded-3xl shadow-xl transition-all duration-300 group"
    >
        <div className="w-12 h-12 bg-[#fa2742]/10 text-[#fa2742] rounded-xl flex items-center justify-center mb-6 transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-[#373833] mb-3">{title}</h3>
        <p className="text-[#373833] leading-relaxed text-sm font-medium">{description}</p>
    </motion.div>
);

const Landing = () => {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 150]);
    const opacityHero = useTransform(scrollY, [0, 300], [1, 0.3]);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#e8eae3] text-[#373833] font-growtext selection:bg-[#fa2742] selection:text-[#373833] overflow-x-hidden">
            {/* Navbar */}
            <nav className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isScrolled ? "bg-[#373833] shadow-md border-b border-[#fa2742]/10 py-4" : "bg-transparent py-6"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-[#fa2742] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                            <ShieldCheck className="text-[#373833]" size={24} />
                        </div>
                        <span className={clsx(
                            "text-xl font-black tracking-tight transition-colors",
                            isScrolled ? "text-[#e8eae3]" : "text-[#373833]"
                        )}>Task Management</span>
                    </div>

                    <div className="flex items-center space-x-10">
                        <div className={clsx(
                            "hidden md:flex items-center space-x-8 text-sm font-semibold transition-colors",
                            isScrolled ? "text-[#e8eae3]" : "text-[#373833]"
                        )}>
                            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:opacity-100 transition-opacity">About Us</a>
                            <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="hover:opacity-100 transition-opacity">Solutions</a>
                            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:opacity-100 transition-opacity">Features</a>
                            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:opacity-100 transition-opacity">Contact Us</a>
                        </div>

                        <Link to="/login" className="px-6 py-2.5 bg-[#fa2742] text-[#373833] font-black rounded-xl hover:opacity-90 transition-all active:scale-95 text-sm shadow-xl">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="relative pt-48 pb-32 px-6 overflow-hidden">
                <motion.div
                    style={{ y: yHero }}
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fa2742]/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"
                ></motion.div>

                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-white rounded-full mb-8 shadow-sm"
                    >
                        <Zap size={14} className="text-[#373833] fill-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#373833]">The Next Gen Project OS</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ opacity: opacityHero }}
                        className="text-6xl md:text-[5.5rem] font-black mb-8 leading-[1] tracking-tight text-[#373833]"
                    >
                        Project Management for <br />
                        <span className="text-[#fa2742] italic font-medium underline decoration-[#fa2742] underline-offset-8">Your Team.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-[#373833]/80 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                    >
                        A secure, scalable platform that accelerates delivery, aligns engineering teams, and provides end-to-end visibility for predictable project outcomes.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center"
                    >
                        <Link to="/login" className="px-12 py-5 bg-[#fa2742] hover:opacity-90 text-[#373833] font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 group active:scale-95">
                            <span>Get Started</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-[#373833]" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-32 px-6 bg-[#e8eae3]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="w-14 h-1 bg-[#fa2742] mb-8 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: 56 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            ></motion.div>
                            <motion.h2
                                className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] text-[#373833]"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                            >Crafting the Architecture<br />for Project Excellence.</motion.h2>
                            <motion.p
                                className="text-lg text-[#373833] leading-relaxed mb-10 font-medium"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                At TechTide, we design systems that help elite teams plan with clarity, ship with confidence, and scale without compromise. Years of engineering discipline and UX rigor distilled into a platform that balances granular control with effortless collaboration—so your team focuses on impact, not process.
                            </motion.p>
                            <motion.div
                                className="grid grid-cols-2 gap-10"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <motion.div
                                    className="p-6 bg-white rounded-3xl shadow-xl"
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}
                                >
                                    <p className="text-4xl font-black text-[#373833] mb-1">99.9%</p>
                                    <p className="text-[10px] text-[#373833] uppercase tracking-widest font-black">Success Rate</p>
                                </motion.div>
                                <motion.div
                                    className="p-6 bg-white rounded-3xl shadow-xl"
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}
                                >
                                    <p className="text-4xl font-black text-[#373833] mb-1">500+</p>
                                    <p className="text-[10px] text-[#373833] uppercase tracking-widest font-black">Elite Teams</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative p-2 bg-[#e8eae3]/5 rounded-[40px] shadow-2xl border border-white/10"
                        >
                            <motion.div
                                className="overflow-hidden rounded-[32px] aspect-[4/3]"
                                whileHover={{ scale: 1.02 }}
                            >
                                <img
                                    src={projectPortal}
                                    alt="Office portal"
                                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-all duration-1000"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solutions" className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <motion.h2
                            className="text-4xl md:text-6xl font-black mb-6 text-[#373833] tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >The TechTide <br /><span className="text-[#fa2742] italic font-medium">Advantage.</span></motion.h2>
                        <motion.p
                            className="text-[#373833] max-w-2xl mx-auto text-lg font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >Solving deep-rooted workflow friction with architectural precision.</motion.p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* The Problem */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="p-12 bg-[#f5f5f5] rounded-[40px] shadow-sm flex flex-col"
                        >
                            <motion.div
                                className="w-14 h-14 bg-[#f5f5f5]/10 text-[#373833] rounded-2xl flex items-center justify-center mb-8"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <AlertCircle size={28} />
                            </motion.div>
                            <h3 className="text-3xl font-black text-[#373833] mb-6 italic">The Industry Chaos</h3>
                            <p className="text-[#373833]/60 mb-10 leading-relaxed font-medium">Fragmented tools and siloed communications create invisible overhead that drains team velocity and burns out talent.</p>
                            <div className="space-y-5 mt-auto">
                                <motion.div
                                    className="p-4 bg-[#e8eae3]/10 rounded-2xl border border-[#e8eae3]/10"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#373833]">Fragmented Toolchain</h4>
                                    <p className="text-xs text-[#373833]/70 mt-1">Multiple disconnected tools force constant context switching. Teams lose momentum as context and work state scatter across apps.</p>
                                </motion.div>

                                <motion.div
                                    className="p-4 bg-[#e8eae3]/10 rounded-2xl border border-[#e8eae3]/10"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#373833]">Siloed Communication</h4>
                                    <p className="text-xs text-[#373833]/70 mt-1">Product, engineering, and QA maintain different source-of-truth documents. Decisions stall when information isn't shared or reconciled in one place.</p>
                                </motion.div>

                                <motion.div
                                    className="p-4 bg-[#e8eae3]/10 rounded-2xl border border-[#e8eae3]/10"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#373833]">Unpredictable Delivery</h4>
                                    <p className="text-xs text-[#373833]/70 mt-1">Weak signals and late-discovered blockers make timelines unreliable. Teams scramble to react instead of preventing slippage.</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* The Solution */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="p-12 bg-white rounded-[40px] shadow-2xl text-[#373833] flex flex-col"
                        >
                            <motion.div
                                className="w-14 h-14 bg-white text-[#373833] rounded-2xl flex items-center justify-center mb-8 shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <CheckCircle2 size={28} />
                            </motion.div>
                            <h3 className="text-3xl font-black mb-6 text-[#373833]">The TechTide Solution</h3>
                            <p className="text-[#373833]/60 mb-10 leading-relaxed font-medium">A singular, high-integrity OS that unifies every stakeholder from SQA to the C-suite in a high-fidelity environment.</p>
                            <div className="grid sm:grid-cols-1 gap-6 mt-auto">
                                {[
                                    {
                                        title: 'Unified Role-Based Workspaces',
                                        desc: 'Context-aware views and permissions that give Product, Engineering, and QA tailored dashboards — reducing noise and accelerating decisions.'
                                    },
                                    {
                                        title: 'Automated Sprints & CI Integration',
                                        desc: 'Connect work to commits and pipelines: auto-link PRs, track release readiness, and surface blockers before sprint end.'
                                    },
                                    {
                                        title: 'Live Predictive Dashboards',
                                        desc: 'Real-time forecasts and risk signals powered by project telemetry — know which milestones will slip and why, before they do.'
                                    }
                                ].map((card, i) => (
                                    <motion.div
                                        key={i}
                                        className="p-4 bg-[#e8eae3]/10 rounded-2xl border border-[#e8eae3]/20 backdrop-blur-sm"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                                        whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                    >
                                        <h4 className="text-sm font-black text-[#373833] mb-1">{card.title}</h4>
                                        <p className="text-xs text-[#373833]/70 font-medium">{card.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-[#e8eae3]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <motion.div
                            className="max-w-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#373833] tracking-tight italic">Built for <span className="text-[#fa2742]">Performance.</span></h2>
                            <p className="text-lg text-[#373833] font-medium leading-relaxed">Engineered with a focus on high-fidelity interactions and technical robustness.</p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="p-12 bg-white rounded-[40px] shadow-xl"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div
                                className="flex flex-col items-center text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                            >
                                <motion.div
                                    className="w-16 h-16 bg-[#fa2742]/10 text-[#fa2742] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <ShieldCheck size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#373833] mb-3">Secure RBAC</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Project-scoped role & permission controls</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Task, milestone, budget, & approval management</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Secure workflows with team collaboration</span>
                                        </motion.li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex flex-col items-center text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                            >
                                <motion.div
                                    className="w-16 h-16 bg-[#fa2742]/10 text-[#fa2742] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Layers size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#373833] mb-3">Integrated Sprints</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <Layers className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">End-to-end sprint planning & prioritization</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <Layers className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Real-time velocity tracking & forecasts</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <Layers className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Auto-link work to commits, PRs, & releases</span>
                                        </motion.li>
                                    </ul>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex flex-col items-center text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                            >
                                <motion.div
                                    className="w-16 h-16 bg-[#fa2742]/10 text-[#fa2742] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <BarChart3 size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#373833] mb-3">Predictive Analytics</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Delivery forecasts from historical velocity</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Risk scoring & bottleneck detection</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-[#fa2742]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(250, 39, 66, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#fa2742] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#373833] font-medium">Predict slippage before impact to delivery</span>
                                        </motion.li>
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-20">
                        <motion.div
                            className="lg:col-span-2 space-y-10"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div>
                                <motion.div
                                    transition={{ duration: 0.8 }}
                                ></motion.div>
                                <h2 className="text-4xl font-black mb-8 text-[#373833] italic leading-tight">Contact <br /><span className="text-[#fa2742]">Us.</span></h2>
                                <p className="text-[#373833] font-medium leading-relaxed">Ready to get started? Our team is here to help.</p>
                            </div>

                            <div className="space-y-6">
                                <motion.div
                                    className="flex items-center space-x-6 group p-4 bg-white rounded-3xl transition-all shadow-sm"
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}
                                >
                                    <motion.div
                                        className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#373833] shadow-lg"
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                    >
                                        <Mail size={24} />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] text-[#373833] uppercase font-black tracking-widest mb-1">Direct HQ</p>
                                        <p className="text-[#373833] font-black text-lg">foundry@techtide.io</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-3"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="p-12 bg-white rounded-[48px] shadow-2xl"
                                whileHover={{ boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}
                            >
                                <form className="grid sm:grid-cols-2 gap-8 relative z-10">
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-black text-[#373833] uppercase tracking-widest ml-1">Message</label>
                                    </div>
                                    <motion.input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full px-6 py-5 bg-[#f5f5f5] border border-[#f5f5f5] rounded-2xl outline-none focus:border-[#fa2742] focus:ring-4 focus:ring-[#fa2742]/5 text-[#373833] font-bold transition-all placeholder:text-[#373833]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(250, 39, 66, 0.1)" }}
                                    />
                                    <motion.input
                                        type="email"
                                        placeholder="Work Email"
                                        className="w-full px-6 py-5 bg-[#f5f5f5] border border-[#f5f5f5] rounded-2xl outline-none focus:border-[#fa2742] focus:ring-4 focus:ring-[#fa2742]/5 text-[#373833] font-bold transition-all placeholder:text-[#373833]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(250, 39, 66, 0.1)" }}
                                    />
                                    <motion.textarea
                                        placeholder="Describe your project goals..."
                                        className="sm:col-span-2 w-full px-6 py-5 bg-[#f5f5f5] border border-[#f5f5f5] rounded-2xl outline-none focus:border-[#fa2742] focus:ring-4 focus:ring-[#fa2742]/5 text-[#373833] font-bold transition-all min-h-[120px] resize-none placeholder:text-[#373833]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(250, 39, 66, 0.1)" }}
                                    ></motion.textarea>
                                    <motion.button
                                        className="sm:col-span-2 py-5 bg-[#fa2742] text-[#373833] font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group uppercase tracking-widest text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span>Send Request</span>
                                        <motion.div whileHover={{ rotate: 12 }}>
                                            <MessageSquare size={18} />
                                        </motion.div>
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={clsx(
                "py-24 px-6 transition-all duration-300",
                isScrolled ? "bg-[#373833] text-[#e8eae3]" : "bg-[#e8eae3] text-[#373833]"
            )}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                        <div className={clsx("flex flex-col", isScrolled ? "text-[#e8eae3]" : "text-[#373833]")}>
                            <h3 className="text-2xl font-black mb-3">Task Management</h3>
                            <p className="text-sm font-medium opacity-80 max-w-xs">Streamline your team's workflow with powerful project orchestration tools.</p>
                        </div>

                        <div className={clsx("flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-widest", isScrolled ? "text-[#e8eae3]" : "text-[#373833]")}>
                            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={clsx("transition-colors", isScrolled ? "hover:text-[#fa2742]" : "hover:text-[#373833]")}>About Us</a>
                            <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className={clsx("transition-colors", isScrolled ? "hover:text-[#fa2742]" : "hover:text-[#373833]")}>Solution</a>
                            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className={clsx("transition-colors", isScrolled ? "hover:text-[#fa2742]" : "hover:text-[#373833]")}>Features</a>
                            <a href="mailto:foundry@techtide.io" className={clsx("transition-colors", isScrolled ? "hover:text-[#fa2742]" : "hover:text-[#373833]")}>Contact Us</a>
                        </div>
                    </div>

                    <div className={clsx("flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t", isScrolled ? "border-[#373833]/10" : "border-[#e8eae3]/10")}>
                        <p className={clsx("text-[10px] uppercase font-bold tracking-widest", isScrolled ? "text-[#e8eae3]" : "text-[#373833]")}>© 2026 Task Management Systems.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;


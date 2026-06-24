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

const FeatureCard = ({ icon: IconComponent, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-8 bg-white rounded-3xl shadow-xl transition-all duration-300 group border border-[--border]"
    >
        <div className="w-12 h-12 bg-gradient-to-br from-[#453abc]/10 to-[#60c3e3]/10 text-[#453abc] rounded-xl flex items-center justify-center mb-6 transition-colors">
            <IconComponent size={24} />
        </div>
        <h3 className="text-xl font-bold text-[#191a23] mb-3">{title}</h3>
        <p className="text-[#6b7280] leading-relaxed text-sm font-medium">{description}</p>
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
        <div className="min-h-screen bg-white text-[#191a23] font-growtext selection:bg-[#453abc] selection:text-white overflow-x-hidden">
            {/* Navbar */}
            <nav className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isScrolled ? "bg-[#030213] shadow-md border-b border-[#60c3e3]/10 py-4" : "bg-transparent py-6"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#453abc] to-[#60c3e3] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <span className={clsx(
                            "text-xl font-black tracking-tight transition-colors",
                            isScrolled ? "text-white" : "text-[#030213]"
                        )}>Task Management</span>
                    </div>

                    <div className="flex items-center space-x-10">
                        <div className={clsx(
                            "hidden md:flex items-center space-x-8 text-sm font-semibold transition-colors",
                            isScrolled ? "text-white" : "text-[#030213]"
                        )}>
                            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:opacity-100 transition-opacity">About Us</a>
                            <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="hover:opacity-100 transition-opacity">Solutions</a>
                            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:opacity-100 transition-opacity">Features</a>
                            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:opacity-100 transition-opacity">Contact Us</a>
                        </div>

                        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white font-black rounded-xl hover:opacity-90 transition-all active:scale-95 text-sm shadow-xl">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="relative pt-28 pb-32 px-6 overflow-hidden">
                <motion.div
                    style={{ y: yHero }}
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"
                ></motion.div>

                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-white rounded-full mb-8 shadow-sm"
                    >
                        <Zap size={14} className="text-[#030213] fill-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#030213]">The Next Gen Project OS</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ opacity: opacityHero }}
                        className="text-6xl md:text-[5.5rem] font-black mb-8 leading-[1] tracking-tight text-[#191a23]"
                    >
                        Project Management for <br />
                        <span className="text-transparent bg-gradient-to-r from-[#453abc] to-[#60c3e3] bg-clip-text italic font-medium">Your Team.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-[#6b7280] max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
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
                        <Link to="/login" className="px-12 py-5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] hover:opacity-90 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 group active:scale-95">
                            <span>Get Started</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-white" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-32 px-6 bg-[--background]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="w-14 h-1 bg-gradient-to-r from-[#453abc] to-[#60c3e3] mb-8 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: 56 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            ></motion.div>
                            <motion.h2
                                className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] text-[#191a23]"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                            >Crafting the Architecture<br />for Project Excellence.</motion.h2>
                            <motion.p
                                className="text-lg text-[#6b7280] leading-relaxed mb-10 font-medium"
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
                                    <p className="text-4xl font-black text-[#191a23] mb-1">99.9%</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-widest font-black">Success Rate</p>
                                </motion.div>
                                <motion.div
                                    className="p-6 bg-white rounded-3xl shadow-xl"
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}
                                >
                                    <p className="text-4xl font-black text-[#191a23] mb-1">500+</p>
                                    <p className="text-[10px] text-[#6b7280] uppercase tracking-widest font-black">Elite Teams</p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative p-2 bg-accent-light/5 rounded-[40px] shadow-2xl border border-[--border]"
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
                            className="text-4xl md:text-6xl font-black mb-6 text-[#191a23] tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >The TechTide <br /><span className="text-transparent bg-gradient-to-r from-[#453abc] to-[#60c3e3] bg-clip-text italic font-medium">Advantage.</span></motion.h2>
                        <motion.p
                            className="text-[#6b7280] max-w-2xl mx-auto text-lg font-medium"
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
                            className="p-12 bg-[#e9ebef] rounded-[40px] shadow-sm flex flex-col"
                        >
                            <motion.div
                                className="w-14 h-14 bg-gradient-to-br from-[#453abc]/10 to-[#60c3e3]/10 text-[#453abc] rounded-2xl flex items-center justify-center mb-8"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <AlertCircle size={28} />
                            </motion.div>
                            <h3 className="text-3xl font-black text-[#191a23] mb-6 italic">The Industry Chaos</h3>
                            <p className="text-[#6b7280] mb-10 leading-relaxed font-medium">Fragmented tools and siloed communications create invisible overhead that drains team velocity and burns out talent.</p>
                            <div className="space-y-5 mt-auto">
                                <motion.div
                                    className="p-4 bg-accent-light/10 rounded-2xl border border-[--border]"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#191a23]">Fragmented Toolchain</h4>
                                    <p className="text-xs text-[#6b7280] mt-1">Multiple disconnected tools force constant context switching. Teams lose momentum as context and work state scatter across apps.</p>
                                </motion.div>

                                <motion.div
                                    className="p-4 bg-accent-light/10 rounded-2xl border border-[--border]"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#191a23]">Siloed Communication</h4>
                                    <p className="text-xs text-[#6b7280] mt-1">Product, engineering, and QA maintain different source-of-truth documents. Decisions stall when information isn't shared or reconciled in one place.</p>
                                </motion.div>

                                <motion.div
                                    className="p-4 bg-accent-light/10 rounded-2xl border border-[--border]"
                                    whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                >
                                    <h4 className="text-sm font-black text-[#191a23]">Unpredictable Delivery</h4>
                                    <p className="text-xs text-[#6b7280] mt-1">Weak signals and late-discovered blockers make timelines unreliable. Teams scramble to react instead of preventing slippage.</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* The Solution */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="p-12 bg-white rounded-[40px] shadow-2xl text-[#191a23] flex flex-col border border-[--border]"
                        >
                            <motion.div
                                className="w-14 h-14 bg-gradient-to-br from-[#453abc] to-[#60c3e3] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <CheckCircle2 size={28} />
                            </motion.div>
                            <h3 className="text-3xl font-black mb-6 text-[#191a23]">The TechTide Solution</h3>
                            <p className="text-[#6b7280] mb-10 leading-relaxed font-medium">A singular, high-integrity OS that unifies every stakeholder from SQA to the C-suite in a high-fidelity environment.</p>
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
                                        className="p-4 bg-accent-light/10 rounded-2xl border border-[--border] backdrop-blur-sm"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                                        whileHover={{ x: 5, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                                    >
                                        <h4 className="text-sm font-black text-[#191a23] mb-1">{card.title}</h4>
                                        <p className="text-xs text-[#6b7280] font-medium">{card.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 bg-[--background]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <motion.div
                            className="max-w-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#191a23] tracking-tight italic">Built for <span className="text-transparent bg-gradient-to-r from-[#453abc] to-[#60c3e3] bg-clip-text">Performance.</span></h2>
                            <p className="text-lg text-[#6b7280] font-medium leading-relaxed">Engineered with a focus on high-fidelity interactions and technical robustness.</p>
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
                                    className="w-16 h-16 bg-gradient-to-br from-[#453abc]/10 to-[#60c3e3]/10 text-[#453abc] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <ShieldCheck size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#191a23] mb-3">Secure RBAC</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Project-scoped role & permission controls</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Task, milestone, budget, & approval management</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <ShieldCheck className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Secure workflows with team collaboration</span>
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
                                    className="w-16 h-16 bg-gradient-to-br from-[#453abc]/10 to-[#60c3e3]/10 text-[#453abc] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Layers size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#191a23] mb-3">Integrated Sprints</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <Layers className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">End-to-end sprint planning & prioritization</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <Layers className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Real-time velocity tracking & forecasts</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <Layers className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Auto-link work to commits, PRs, & releases</span>
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
                                    className="w-16 h-16 bg-gradient-to-br from-[#453abc]/10 to-[#60c3e3]/10 text-[#453abc] rounded-2xl flex items-center justify-center flex-shrink-0 mb-4"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <BarChart3 size={32} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-black text-[#191a23] mb-3">Predictive Analytics</h3>
                                    <ul className="space-y-2">
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Delivery forecasts from historical velocity</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Risk scoring & bottleneck detection</span>
                                        </motion.li>
                                        <motion.li
                                            className="flex items-start space-x-2 p-2 bg-gradient-to-br from-[#453abc]/5 to-[#60c3e3]/5 rounded-lg"
                                            whileHover={{ x: 5, backgroundColor: "rgba(69, 58, 188, 0.1)" }}
                                        >
                                            <BarChart3 className="text-[#453abc] flex-shrink-0 mt-0.5" size={14} />
                                            <span className="text-xs text-[#6b7280] font-medium">Predict slippage before impact to delivery</span>
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
                                <h2 className="text-4xl font-black mb-8 text-[#191a23] italic leading-tight">Contact <br /><span className="text-transparent bg-gradient-to-r from-[#453abc] to-[#60c3e3] bg-clip-text">Us.</span></h2>
                                <p className="text-[#6b7280] font-medium leading-relaxed">Ready to get started? Our team is here to help.</p>
                            </div>

                            <div className="space-y-6">
                                <motion.div
                                    className="flex items-center space-x-6 group p-4 bg-white rounded-3xl transition-all shadow-sm border border-[--border]"
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}
                                >
                                    <motion.div
                                        className="w-14 h-14 bg-gradient-to-br from-[#453abc] to-[#60c3e3] rounded-2xl flex items-center justify-center text-white shadow-lg"
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                    >
                                        <Mail size={24} />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] text-[#6b7280] uppercase font-black tracking-widest mb-1">Direct HQ</p>
                                        <p className="text-[#191a23] font-black text-lg">foundry@techtide.io</p>
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
                                        <label className="text-xs font-black text-[#191a23] uppercase tracking-widest ml-1">Message</label>
                                    </div>
                                    <motion.input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full px-6 py-5 bg-[#e9ebef] border border-[#e9ebef] rounded-2xl outline-none focus:border-[#453abc] focus:ring-4 focus:ring-[#453abc]/5 text-[#191a23] font-bold transition-all placeholder:text-[#6b7280]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(69, 58, 188, 0.1)" }}
                                    />
                                    <motion.input
                                        type="email"
                                        placeholder="Work Email"
                                        className="w-full px-6 py-5 bg-[#e9ebef] border border-[#e9ebef] rounded-2xl outline-none focus:border-[#453abc] focus:ring-4 focus:ring-[#453abc]/5 text-[#191a23] font-bold transition-all placeholder:text-[#6b7280]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(69, 58, 188, 0.1)" }}
                                    />
                                    <motion.textarea
                                        placeholder="Describe your project goals..."
                                        className="sm:col-span-2 w-full px-6 py-5 bg-[#e9ebef] border border-[#e9ebef] rounded-2xl outline-none focus:border-[#453abc] focus:ring-4 focus:ring-[#453abc]/5 text-[#191a23] font-bold transition-all min-h-[120px] resize-none placeholder:text-[#6b7280]"
                                        whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(69, 58, 188, 0.1)" }}
                                    ></motion.textarea>
                                    <motion.button
                                        className="sm:col-span-2 py-5 bg-gradient-to-r from-[#453abc] to-[#60c3e3] text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 group uppercase tracking-widest text-xs"
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
            <footer className="py-24 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black mb-3">Task Management</h3>
                            <p className="text-sm font-medium opacity-80 max-w-xs">Streamline your team's workflow with powerful project orchestration tools.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-widest">
                            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-[#453abc] transition-colors">About Us</a>
                            <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="hover:text-[#453abc] transition-colors">Solution</a>
                            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-[#453abc] transition-colors">Features</a>
                            <a href="mailto:foundry@techtide.io" className="hover:text-[#453abc] transition-colors">Contact Us</a>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-[--border]">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[#6b7280]">© 2026 Task Management Systems.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;


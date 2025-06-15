
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Cpu, Shield, Sparkles, Zap, Users, Bot, MessageSquare } from 'lucide-react';
import ImagePlaceholder from '../components/ImagePlaceholder';

const AIAgentsSection: React.FC = () => {
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      }
    })
  };

  const agentCards = [
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Sales Assistant",
      description: "Update sales proposals, track leads, and manage your pipeline with ease.",
      color: "bg-purple-100"
    },
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      title: "IT Helper",
      description: "Resolve IT issues, reset passwords, and manage access requests automatically.",
      color: "bg-blue-100"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "HR Buddy",
      description: "Set reminders for team events, answer policy questions, and manage time off.",
      color: "bg-green-100"
    },
    {
      icon: <Brain className="w-8 h-8 text-yellow-600" />,
      title: "Creative Assistant",
      description: "Generate ideas, summarize discussions, and help with content creation.",
      color: "bg-yellow-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <Bot className="w-10 h-10 text-purple-600 mr-3" />
            <span className="text-purple-600 font-semibold text-lg">AI Agents</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            There's an AI agent for everyone in SlackAI.
          </h2>
          <p className="text-lg text-slate-700">
            Update sales proposals, set team reminders, resolve IT issues and so much more with always-on, action-taking AI agents in SlackAI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {agentCards.map((card, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={fadeInUpVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`${card.color} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
                {card.title}
              </h3>
              <p className="text-slate-700 text-center">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="rounded-xl overflow-hidden shadow-xl">
              <ImagePlaceholder 
                imageType="feature"
                text="Slack AI in action"
                height="350px"
                className="w-full"
              />
            </div>
            
            {/* Animated indicators */}
            <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 p-6"
          >
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
              <span className="text-purple-600 font-semibold">Advanced AI</span>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Powered by advanced AI
            </h3>
            <p className="text-slate-700 mb-6">
              Slack AI agents can understand context, learn from interactions, and take actions on your behalf. They integrate seamlessly with your existing workflows and tools.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                { icon: <Zap className="w-4 h-4" />, text: "Automate routine tasks" },
                { icon: <Brain className="w-4 h-4" />, text: "Answer questions using your company knowledge" },
                { icon: <Users className="w-4 h-4" />, text: "Connect to your business systems" },
                { icon: <Bot className="w-4 h-4" />, text: "Learn from your team's interactions" }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="mr-3 mt-1 text-green-500">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white group">
              <Bot className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Learn more about AI agents 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIAgentsSection;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

const VoiceAssistantButton = ({
    isListening,
    voiceTranscript,
    voiceFeedback,
    toggleVoiceCommand
}) => {
    return (
        <div className="fixed bottom-24 right-6 z-[1000] flex flex-col items-end gap-3">
            {/* Voice Feedback Overlay */}
            <AnimatePresence>
                {(voiceFeedback || voiceTranscript) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-slate-900/95 backdrop-blur-lg text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 max-w-xs"
                    >
                        {voiceTranscript && (
                            <div className="text-sm text-blue-400 mb-1 font-medium">🎤 "{voiceTranscript}"</div>
                        )}
                        <div className="text-sm font-semibold">{voiceFeedback}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mic Button */}
            <motion.button
                onClick={toggleVoiceCommand}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-full shadow-2xl transition-all border-none cursor-pointer ${isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 ring-4 ring-red-500/50 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    }`}
                title={isListening ? 'Stop listening' : 'Voice command (say "help" for commands)'}
            >
                {isListening ? (
                    <MicOff className="text-white" size={24} />
                ) : (
                    <Mic className="text-white" size={24} />
                )}
            </motion.button>
        </div>
    );
};

export default VoiceAssistantButton;

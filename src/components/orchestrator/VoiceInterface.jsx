import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
`;

const VoiceControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const VoiceButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.isRecording) {
      return `
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        animation: pulse 1.5s infinite;
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
    } else if (props.isPlaying) {
      return `
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `;
    } else {
      return `
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VoiceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'recording': return '#ef4444';
      case 'playing': return '#10b981';
      case 'idle': return '#9ca3af';
      default: return '#9ca3af';
    }
  }};
  animation: ${props => props.status === 'recording' ? 'pulse 1s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const VoiceInput = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
  
  ${props => props.isRecording && `
    border-color: #ef4444;
    background: #fef2f2;
  `}
`;

const VoiceText = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  min-height: 20px;
  
  ${props => props.isRecording && `
    color: #dc2626;
    font-weight: 500;
  `}
`;

const LanguageSelector = styled.select`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const VoiceInterface = ({ 
  onVoiceInput = null,
  onVoiceOutput = null,
  textToSpeak = '',
  supportedLanguages = ['en', 'hi'],
  defaultLanguage = 'en',
  autoRestartRecognition = false,
  className = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(defaultLanguage);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  const recognitionRef = useRef(null);
  const speechRef = useRef(null);
  const transcriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const lastSpokenTextRef = useRef('');

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopSpeaking = () => {
    if (speechRef.current) {
      try {
        speechRef.current.cancel();
      } catch (e) {
        // no-op
      }
    }
    setIsPlaying(false);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // no-op
      }
    }
  };

  const commitTranscript = () => {
    const finalText = (transcriptRef.current || '').trim();
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    setTranscript('');

    if (finalText && onVoiceInput) {
      onVoiceInput(finalText);
    }
  };

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        clearSilenceTimer();
      };
      
      recognitionInstance.onresult = (event) => {
        let newFinal = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += t;
          } else {
            interimTranscript += t;
          }
        }

        if (newFinal.trim()) {
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + newFinal).trim();
        }

        const combinedTranscript = (finalTranscriptRef.current + ' ' + interimTranscript).trimStart();
        transcriptRef.current = combinedTranscript;
        setTranscript(combinedTranscript);

        if (combinedTranscript) {
          if (isPlaying) {
            stopSpeaking();
          }

          clearSilenceTimer();
          silenceTimerRef.current = setTimeout(() => {
            stopRecording();
          }, 1200);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        const err = event?.error;
        if (err !== 'aborted' && err !== 'no-speech') {
          console.error('Speech recognition error:', err);
        }
        setIsRecording(false);
        clearSilenceTimer();
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
        clearSilenceTimer();
        commitTranscript();

        if (autoRestartRecognition) {
          if (speechRef.current?.speaking) return;
          try {
            recognitionInstance.start();
          } catch (error) {
            // Ignore if start is called while already started.
          }
        }
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }
    
    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      speechRef.current = window.speechSynthesis;
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        // no-op
      }

      try {
        speechRef.current?.cancel();
      } catch (error) {
        // no-op
      }

      clearSilenceTimer();
    };
  }, [language, onVoiceInput, autoRestartRecognition]);

  const startRecording = () => {
    if (recognition && !isRecording && !isPlaying) {
      try {
        transcriptRef.current = '';
        finalTranscriptRef.current = '';
        recognition.start();
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const stopRecordingUi = () => {
    if (recognition && isRecording) {
      stopRecording();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingUi();
    } else {
      startRecording();
    }
  };

  const speakText = (text) => {
    if (speechSynthesis && text) {
      // Stop any current speech
      stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        if (isRecording) {
          stopRecording();
        }
      };
      utterance.onend = () => {
        setIsPlaying(false);
        if (autoRestartRecognition) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // no-op
          }
        }
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    if (isPlaying) {
      stopSpeaking();
    } else if (textToSpeak) {
      speakText(textToSpeak);
    }
  };

  useEffect(() => {
    const next = (textToSpeak || '').trim();
    if (!next) return;
    if (!speechSynthesis) return;

    if (next === lastSpokenTextRef.current) return;
    lastSpokenTextRef.current = next;

    speakText(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToSpeak, speechSynthesis, language]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (recognition) {
      recognition.lang = newLanguage === 'hi' ? 'hi-IN' : 'en-US';
    }
  };

  const getStatusText = () => {
    if (isRecording) return 'Recording...';
    if (isPlaying) return 'Speaking...';
    return 'Ready';
  };

  const getStatus = () => {
    if (isRecording) return 'recording';
    if (isPlaying) return 'playing';
    return 'idle';
  };

  const languageNames = {
    'en': 'English',
    'hi': 'हिंदी (Hindi)'
  };

  return (
    <VoiceContainer className={className}>
      <VoiceControls>
        <VoiceButton
          onClick={toggleRecording}
          isRecording={isRecording}
          disabled={!recognition}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? '⏹️' : '🎤'}
        </VoiceButton>
        
        <VoiceButton
          onClick={toggleSpeaking}
          isPlaying={isPlaying}
          disabled={!speechSynthesis || !textToSpeak}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Stop Speaking' : 'Speak Response'}
        >
          {isPlaying ? '⏹️' : '🔊'}
        </VoiceButton>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <VoiceStatus>
            <StatusIndicator status={getStatus()} />
            {getStatusText()}
          </VoiceStatus>
          
          <LanguageSelector
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {supportedLanguages.map(lang => (
              <option key={lang} value={lang}>
                {languageNames[lang] || lang}
              </option>
            ))}
          </LanguageSelector>
        </div>
      </VoiceControls>
      
      <AnimatePresence>
        {(isRecording || transcript) && (
          <VoiceInput
            isRecording={isRecording}
            as={motion.div}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontSize: '1.25rem' }}>
              {isRecording ? '🎤' : '📝'}
            </span>
            <VoiceText isRecording={isRecording}>
              {transcript || (isRecording ? 'Listening...' : '')}
            </VoiceText>
          </VoiceInput>
        )}
      </AnimatePresence>
      
      {!recognition && (
        <div style={{ 
          color: '#ef4444', 
          fontSize: '0.875rem', 
          textAlign: 'center',
          padding: '1rem',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ Speech recognition is not supported in this browser
        </div>
      )}
      
      {!speechSynthesis && (
        <div style={{ 
          color: '#f59e0b', 
          fontSize: '0.875rem', 
          textAlign: 'center',
          padding: '1rem',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fed7aa'
        }}>
          ⚠️ Speech synthesis is not supported in this browser
        </div>
      )}
    </VoiceContainer>
  );
};

export default VoiceInterface;

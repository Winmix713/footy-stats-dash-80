import React, { useCallback, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Input, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';

interface FeedbackType {
  value: string;
  label: string;
}

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackTypes?: FeedbackType[];
  maxCharacters?: number;
  onSubmit?: (data: { type: string; text: string; email?: string }) => Promise<void>;
  translations?: {
    title: string;
    description: string;
    typeLabel: string;
    textLabel: string;
    textPlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailNote: string;
    cancel: string;
    submit: string;
    submitting: string;
    thankYou: string;
    successMessage: string;
    charactersLeft: string;
    validationRequired: string;
    validationEmail: string;
  };
}

interface ValidationErrors {
  feedbackText?: string;
  email?: string;
}

const defaultFeedbackTypes: FeedbackType[] = [
  { value: "feature", label: "Új funkció javaslat" },
  { value: "bug", label: "Hibajelentés" },
  { value: "improvement", label: "Fejlesztési javaslat" },
  { value: "other", label: "Egyéb" },
];

const defaultTranslations = {
  title: "Visszajelzés küldése",
  description: "Segítsen nekünk jobbá tenni a WinMix alkalmazást! Ossza meg velünk észrevételeit, javaslatait vagy jelentse a hibákat.",
  typeLabel: "Visszajelzés típusa",
  textLabel: "Visszajelzés",
  textPlaceholder: "Írja le részletesen a javaslatát vagy a tapasztalt hibát...",
  emailLabel: "Email cím (opcionális)",
  emailPlaceholder: "email@example.com",
  emailNote: "Csak akkor adjuk meg, ha szeretne választ kapni a visszajelzésére.",
  cancel: "Mégsem",
  submit: "Visszajelzés küldése",
  submitting: "Küldés...",
  thankYou: "Köszönjük a visszajelzést!",
  successMessage: "Az észrevételeit továbbítottuk a fejlesztőcsapatnak.",
  charactersLeft: "karakter maradt",
  validationRequired: "Kötelező megadni a visszajelzést!",
  validationEmail: "Érvénytelen e-mail cím!",
};

const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  isOpen, 
  onClose,
  feedbackTypes = defaultFeedbackTypes,
  maxCharacters = 500,
  onSubmit,
  translations = defaultTranslations
}) => {
  const [feedbackType, setFeedbackType] = React.useState<string>("feature");
  const [feedbackText, setFeedbackText] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  // Character count calculation
  const remainingChars = useMemo(() => 
    maxCharacters - feedbackText.length, 
    [feedbackText.length, maxCharacters]
  );

  // Validation function
  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (!feedbackText.trim()) {
      newErrors.feedbackText = translations.validationRequired;
    }
    
    if (email && !validateEmail(email)) {
      newErrors.email = translations.validationEmail;
    }
    
    return newErrors;
  }, [feedbackText, email, translations]);

  // Submit handler with validation
  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit({
          type: feedbackType,
          text: feedbackText,
          email: email || undefined,
        });
      } else {
        // Default simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setIsSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFeedbackText("");
        setEmail("");
        setFeedbackType("feature");
        setIsSubmitted(false);
        setErrors({});
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Handle API errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackType, feedbackText, email, onSubmit, onClose, validateForm, translations]);

  // Reset form when modal closes
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setFeedbackText("");
      setEmail("");
      setFeedbackType("feature");
      setIsSubmitted(false);
      setErrors({});
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Input change handlers with error clearing
  const handleTextChange = useCallback((value: string) => {
    setFeedbackText(value);
    if (errors.feedbackText && value.trim()) {
      setErrors(prev => ({ ...prev, feedbackText: undefined }));
    }
  }, [errors.feedbackText]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (errors.email && (!value || validateEmail(value))) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} backdrop="blur" isDismissable={!isSubmitting}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icon 
                  icon="lucide:message-square" 
                  className="text-violet-400" 
                  width={20} 
                  height={20}
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold">{translations.title}</h3>
              </div>
            </ModalHeader>
            
            <ModalBody className="py-6">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
                    <Icon 
                      icon="lucide:check" 
                      className="text-emerald-400" 
                      width={32} 
                      height={32}
                      aria-hidden="true"
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">{translations.thankYou}</h4>
                  <p className="text-zinc-300 text-center">{translations.successMessage}</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <p className="text-zinc-300 mb-4">
                    {translations.description}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="feedback-type" className="block text-sm text-zinc-400 mb-1">
                        {translations.typeLabel}
                      </label>
                      <Select
                        id="feedback-type"
                        selectedKeys={[feedbackType]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          setFeedbackType(selected);
                        }}
                        className="w-full"
                        aria-label={translations.typeLabel}
                      >
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="feedback-text" className="block text-sm text-zinc-400 mb-1">
                        {translations.textLabel}
                      </label>
                      <Textarea
                        id="feedback-text"
                        placeholder={translations.textPlaceholder}
                        value={feedbackText}
                        onValueChange={handleTextChange}
                        minRows={4}
                        maxLength={maxCharacters}
                        className="w-full"
                        isInvalid={!!errors.feedbackText}
                        errorMessage={errors.feedbackText}
                        aria-describedby="char-count feedback-text-error"
                      />
                      <div 
                        id="char-count"
                        className={`text-right text-xs mt-1 ${
                          remainingChars < 50 ? 'text-orange-400' : 'text-zinc-400'
                        }`}
                      >
                        {remainingChars} {translations.charactersLeft}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm text-zinc-400 mb-1">
                        {translations.emailLabel}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={translations.emailPlaceholder}
                        value={email}
                        onValueChange={handleEmailChange}
                        className="w-full"
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                        aria-describedby="email-note"
                      />
                      <p id="email-note" className="text-xs text-zinc-500 mt-1">
                        {translations.emailNote}
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </ModalBody>
            
            <ModalFooter className="border-t border-white/10">
              {!isSubmitted && (
                <>
                  <Button
                    variant="flat"
                    color="default"
                    onPress={handleClose}
                    className="text-zinc-300"
                    isDisabled={isSubmitting}
                    aria-label="Cancel feedback submission"
                  >
                    {translations.cancel}
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    isDisabled={!feedbackText.trim() || isSubmitting || remainingChars < 0}
                    aria-label="Submit feedback"
                  >
                    {isSubmitting ? translations.submitting : translations.submit}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
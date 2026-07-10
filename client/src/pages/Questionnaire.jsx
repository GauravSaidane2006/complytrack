import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetQuestionsQuery, useSaveAnswersMutation } from '../store/api/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function Questionnaire() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading } = useGetQuestionsQuery()
  const [saveAnswers] = useSaveAnswersMutation()

  const questions = data?.questions || []
  const totalSteps = questions.length

  useEffect(() => {
    if (data?.questionnaireCompleted) {
      navigate('/compliance-setup', { replace: true })
    }
  }, [data, navigate])

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    const currentQuestion = questions[currentStep]
    if (currentQuestion && !answers[currentQuestion.id]) {
      toast.error('Please select an answer to continue')
      return
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => q.required && !answers[q.id])
    if (unanswered.length > 0) {
      toast.error(`Please answer all required questions (${unanswered.length} remaining)`)
      return
    }

    setIsSubmitting(true)
    try {
      await saveAnswers({ answers }).unwrap()
      toast.success('Questionnaire completed! Redirecting to compliance setup...')
      setTimeout(() => navigate('/compliance-setup'), 1500)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save answers')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />

  const question = questions[currentStep]
  if (!question) return null

  const progress = ((currentStep + 1) / totalSteps) * 100
  const isLastStep = currentStep === totalSteps - 1
  const allAnswered = questions.every((q) => !q.required || answers[q.id])

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-stone-900 mb-3">Compliance Profile Setup</h1>
          <p className="text-xl text-stone-600">
            Answer these questions so we can provide the most relevant compliance requirements for your business.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
          <div className="bg-stone-100 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-600">
              Question {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-stone-600">
              {Math.round(progress)}% Complete
            </span>
          </div>

          <div className="h-2 bg-stone-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            <div className="mb-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">
                {question.id === 'turnover' || question.id === 'employees' || question.id === 'companyType' || question.id === 'hasPhysicalOffice' || question.id === 'importsExports'
                  ? 'General Information'
                  : data?.sector === 'service'
                    ? 'Service Sector'
                    : data?.sector === 'manufacturing'
                      ? 'Manufacturing Sector'
                      : 'Trading Sector'
                }
              </span>
            </div>

            <h2 className="text-2xl font-bold text-stone-900 mt-4 mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    answers[question.id] === option.value
                      ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[question.id] === option.value
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-stone-300'
                    }`}>
                      {answers[question.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-lg font-medium ${
                      answers[question.id] === option.value ? 'text-orange-700' : 'text-stone-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-3 border border-stone-200 rounded-xl text-base font-semibold hover:bg-stone-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !allAnswered}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-base font-semibold hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-base font-semibold hover:from-orange-700 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-orange-500 scale-125'
                  : answers[questions[i]?.id]
                    ? 'bg-orange-300'
                    : 'bg-stone-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MapSelector = dynamic(() => import('./components/MapSelector'), {
  ssr: false,
})

interface Job {
  id: number
  title: string
  description: string
  location: string
  salary_min: number | null
  salary_max: number | null
  employment_type: string
  requirements: string | null
  responsibilities: string | null
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    currentLivingPlace: '',
    placeToWork: '',
    jobTitle: '',
    expectedSalary: '',
    info: '',
  })
  const [showMap, setShowMap] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?active=true')
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    setFormData({
      ...formData,
      jobTitle: job.title,
      placeToWork: job.location
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleLocationSelect = (locationName: string) => {
    setFormData({ ...formData, placeToWork: locationName })
    setShowMap(false)
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let cvUrl = null

      // Upload CV if provided
      if (cvFile) {
        setUploading(true)
        const cvFormData = new FormData()
        cvFormData.append('cv', cvFile)

        const uploadResponse = await fetch('/api/upload-cv', {
          method: 'POST',
          body: cvFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('CV yükləmə uğursuz oldu')
        }

        const uploadData = await uploadResponse.json()
        cvUrl = uploadData.url
        setUploading(false)
      }

      // Submit application
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jobId: selectedJob?.id,
          cvUrl,
        }),
      })

      const data = await response.json()
      console.log(data)

      if (response.ok) {
        // Show success popup
        setShowSuccess(true)

        // Reset form
        setFormData({
          name: '',
          surname: '',
          phone: '',
          email: '',
          currentLivingPlace: '',
          placeToWork: '',
          jobTitle: '',
          expectedSalary: '',
          info: '',
        })
        setCvFile(null)

        // After 3 seconds, hide popup and redirect to homepage
        setTimeout(() => {
          setShowSuccess(false)
          setSelectedJob(null)
          fetchJobs() // Refresh jobs list
        }, 3000)
      } else {
        alert('Müraciət göndərilmədi. Zəhmət olmasa yenidən cəhd edin.')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start sm:justify-center p-3 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 animate-fadeIn pt-4 sm:pt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Bizim Oba
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">Komandamıza Qoşulun</p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">CV-nizi bazaya əlavə edin</p>
        </div>

        {/* Jobs List - Always show unless a job is selected */}
        {!selectedJob && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Aktiv Vakansiyalar
            </h2>

            {jobs.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleJobSelect(job)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 hover:shadow-lg cursor-pointer transition-all duration-300"
                    >
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          📍 {job.location}
                        </span>
                        {job.salary_min && job.salary_max && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                            💰 {job.salary_min}-{job.salary_max} AZN
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setSelectedJob({} as Job)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    və ya ümumi müraciət göndərin
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hal-hazırda aktiv vakansiya yoxdur
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Lakin siz ümumi müraciət göndərə bilərsiniz
                </p>
                <button
                  onClick={() => setSelectedJob({} as Job)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Ümumi Müraciət Göndər
                </button>
              </div>
            )}
          </div>
        )}

        {/* Application Form */}
        {selectedJob && (
          <>
            {selectedJob && selectedJob.id && (
              <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-emerald-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {selectedJob.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedJob.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <form className="w-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100 dark:border-gray-700 animate-slideUp" onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                <div className="w-full md:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6 md:mb-0">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="name">
                    Ad
                  </label>
                  <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="name" type="text" placeholder="Ayşə" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="w-full md:w-1/2 px-2 sm:px-3">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="surname">
                    Soyad
                  </label>
                  <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="surname" type="text" placeholder="Məmmədova" value={formData.surname} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                <div className="w-full md:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6 md:mb-0">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="phone">
                    Telefon
                  </label>
                  <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="phone" type="tel" placeholder="+994 50 555 55 55" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="w-full md:w-1/2 px-2 sm:px-3">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="email">
                    Email (İstəyə görə)
                  </label>
                  <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="email" type="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                <div className="w-full px-2 sm:px-3">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="currentLivingPlace">
                    Hazırki yaşayış yeri
                  </label>
                  <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="currentLivingPlace" type="text" placeholder="Bakı, Azərbaycan" value={formData.currentLivingPlace} onChange={handleChange} required />
                </div>
              </div>

              {!selectedJob?.id && (
                <>
                  <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                    <div className="w-full px-2 sm:px-3">
                      <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="placeToWork">
                        İş yeri
                      </label>
                      <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 mb-3 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="placeToWork" type="text" placeholder="İşləmək istədiyiniz marketi seçin" value={formData.placeToWork} readOnly required />
                      <button type="button" onClick={() => setShowMap(!showMap)} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-md">
                        {showMap ? '✕ Xəritəni Gizlət' : '📍 Xəritədən Seç'}
                      </button>
                    </div>
                  </div>
                  {showMap && (
                    <div className="mb-4 sm:mb-6">
                      <MapSelector onLocationSelect={handleLocationSelect} />
                    </div>
                  )}
                  <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                    <div className="w-full md:w-1/2 px-2 sm:px-3 mb-4 sm:mb-6 md:mb-0">
                      <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="jobTitle">
                        Vəzifə
                      </label>
                      <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="jobTitle" type="text" placeholder="Kassir" value={formData.jobTitle} onChange={handleChange} required />
                    </div>
                    <div className="w-full md:w-1/2 px-2 sm:px-3">
                      <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="expectedSalary">
                        Gözlənilən maaş (AZN)
                      </label>
                      <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="expectedSalary" type="number" placeholder="500" value={formData.expectedSalary} onChange={handleChange} required />
                    </div>
                  </div>
                </>
              )}

              {selectedJob?.id && (
                <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                  <div className="w-full px-2 sm:px-3">
                    <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="expectedSalary">
                      Gözlənilən maaş (AZN)
                    </label>
                    <input className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" id="expectedSalary" type="number" placeholder="500" value={formData.expectedSalary} onChange={handleChange} required />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                <div className="w-full px-2 sm:px-3">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="cv">
                    CV Yüklə (PDF, DOC, DOCX - İstəyə görə)
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                  />
                  {cvFile && (
                    <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                      ✓ {cvFile.name} seçildi
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 sm:-mx-3 mb-4 sm:mb-6">
                <div className="w-full px-2 sm:px-3">
                  <label className="block tracking-wide text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold mb-2" htmlFor="info">
                    Əlavə məlumat
                  </label>
                  <textarea className="appearance-none block w-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[100px] sm:min-h-[120px] resize-y" id="info" placeholder="Özünüz haqqında, təcrübəniz və niyə komandamıza qoşulmaq istədiyiniz barədə bizə məlumat verin..." value={formData.info} onChange={handleChange}></textarea>
                </div>
              </div>
              <div className="flex flex-wrap -mx-2 sm:-mx-3 mt-6 sm:mt-8">
                <div className="w-full px-2 sm:px-3">
                  <button
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:via-teal-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform active:scale-95 sm:hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:scale-100"
                    type="submit"
                    disabled={uploading || submitting}
                  >
                    {uploading ? 'CV yüklənir...' : submitting ? 'Göndərilir...' : 'Müraciəti Göndər'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform animate-slideUp">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <svg
                  className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Təbriklər!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                Müraciətiniz uğurla göndərildi
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                Tezliklə sizinlə əlaqə saxlayacağıq
              </p>
              <div className="mt-6">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-progress"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

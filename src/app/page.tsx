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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {jobs.length} Aktiv İş Elanı
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Karyeranıza{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Başlayın
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto">
              Azərbaycanın ən böyük supermarket şəbəkəsində
            </p>

            <p className="text-lg text-gray-500 dark:text-gray-500 mb-8 max-w-2xl mx-auto">
              1,610+ mağazada minlərlə iş imkanı • CV-nizi yükləyin və dərhal müraciət edin
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">1,610+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mağaza Şəbəkəsi</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{jobs.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Aktiv Vakansiya</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">24h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cavab Müddəti</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">5,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Əməkdaş</div>
              </div>
            </div>
          </div>

          {/* Jobs List - Always show unless a job is selected */}
          {!selectedJob && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  💼 Açıq Vakansiyalar
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {jobs.length} elan
                </div>
              </div>

              {jobs.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:gap-6">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleJobSelect(job)}
                        className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {job.title}
                          </h3>
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            📍 {job.location}
                          </span>
                          {job.salary_min && job.salary_max && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                              💰 {job.salary_min}-{job.salary_max} AZN
                            </span>
                          )}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                            ⏰ {job.employment_type === 'full_time' ? 'Tam ştat' : 'Yarım ştat'}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                          {job.description}
                        </p>

                        <button className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                          Müraciət et
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setSelectedJob({} as Job)}
                      className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                    >
                      və ya ümumi müraciət göndərin →
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">💼</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Hal-hazırda aktiv vakansiya yoxdur
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Lakin siz ümumi müraciət göndərə və CV-nizi bazamıza əlavə edə bilərsiniz
                  </p>
                  <button
                    onClick={() => setSelectedJob({} as Job)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    Ümumi Müraciət Göndər
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Application Form */}
          {selectedJob && (
            <div className="max-w-4xl mx-auto">
              {selectedJob && selectedJob.id && (
                <div className="mb-6 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium opacity-90 mb-1">Müraciət edirsiz</div>
                      <h3 className="text-2xl font-bold mb-2">
                        {selectedJob.title}
                      </h3>
                      <p className="text-emerald-100 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedJob.location}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <form className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100 dark:border-gray-700 animate-slideUp" onSubmit={handleSubmit}>
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
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-600 hover:via-teal-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform active:scale-95 sm:hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:scale-100"
                      type="submit"
                      disabled={uploading || submitting}
                    >
                      {uploading ? 'CV yüklənir...' : submitting ? 'Göndərilir...' : 'Müraciəti Göndər'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
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
    </div>
  )
}

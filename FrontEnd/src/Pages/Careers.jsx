// ===== src/Pages/Careers.jsx =====
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, COMPANY_INFO } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Modal from '../Components/Common/Modal';

// Styles
import '../Styles/Careers.css';

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: '',
    linkedIn: ''
  });

  const jobs = [
    {
      id: 1,
      title: 'Senior Automotive Technician',
      department: 'Service',
      location: 'Roysambu (next to TRM)',
      type: 'Full-time',
      experience: '5+ years',
      description: 'We are seeking an experienced automotive technician specializing in luxury and exotic vehicles. You will be responsible for diagnostics, maintenance, and repairs on high-end automobiles.',
      responsibilities: [
        'Perform diagnostics and repairs on luxury vehicles',
        'Maintain detailed service records',
        'Communicate with customers about service needs',
        'Stay current with manufacturer training',
        'Mentor junior technicians'
      ],
      requirements: [
        'ASE Master Technician certification',
        '5+ years experience with luxury brands',
        'Experience with diagnostic software',
        'Strong attention to detail',
        'Excellent communication skills'
      ],
      benefits: [
        'Competitive salary + bonus',
        'Health, dental, and vision insurance',
        '401(k) with company match',
        'Paid time off and holidays',
        'Ongoing training and certification',
        'Vehicle purchase discounts'
      ]
    },
    {
      id: 2,
      title: 'Customer Experience Manager',
      department: 'Operations',
      location: 'Westlands',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Lead our customer experience team to deliver exceptional white-glove service to our discerning clientele. You will oversee the concierge team and ensure every interaction exceeds expectations.',
      responsibilities: [
        'Manage the customer experience team',
        'Develop and implement service standards',
        'Handle escalated customer inquiries',
        'Analyze customer feedback and metrics',
        'Train new team members',
        'Coordinate with other departments'
      ],
      requirements: [
        '3+ years in luxury service management',
        'Excellent communication and leadership skills',
        'Experience with CRM systems',
        'Problem-solving mindset',
        'Flexible schedule including weekends'
      ],
      benefits: [
        'Competitive salary + bonus',
        'Health, dental, and vision insurance',
        '401(k) with company match',
        'Paid time off',
        'Career advancement opportunities',
        'Vehicle rental privileges'
      ]
    },
    {
      id: 3,
      title: 'Detail Specialist',
      department: 'Detailing',
      location: 'Upper Hill',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Join our award-winning detailing team to provide premium car care services. You will perform exterior and interior detailing, paint correction, and ceramic coating applications.',
      responsibilities: [
        'Perform exterior and interior detailing',
        'Execute paint correction and ceramic coating',
        'Maintain detailing equipment and supplies',
        'Ensure quality control standards',
        'Document before/after photos',
        'Assist with inventory management'
      ],
      requirements: [
        '2+ years professional detailing experience',
        'Knowledge of detailing products and techniques',
        'Experience with paint correction',
        'Ceramic coating certification preferred',
        'Attention to detail',
        'Valid driver\'s license'
      ],
      benefits: [
        'Competitive hourly rate + tips',
        'Health insurance options',
        'Paid time off',
        'Product discounts',
        'Training and certification',
        'Performance bonuses'
      ]
    },
    {
      id: 4,
      title: 'Sales Consultant',
      department: 'Sales',
      location: 'Roysambu (next to TRM)',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Join our luxury vehicle sales team to help clients find their dream cars. You will guide customers through the purchasing process and build lasting relationships.',
      responsibilities: [
        'Assist customers in vehicle selection',
        'Conduct test drives and vehicle demonstrations',
        'Negotiate sales and financing terms',
        'Maintain product knowledge',
        'Follow up with prospects',
        'Achieve sales targets'
      ],
      requirements: [
        '2+ years luxury sales experience',
        'Excellent interpersonal skills',
        'Knowledge of luxury vehicles',
        'Self-motivated and goal-oriented',
        'Valid driver\'s license',
        'Flexible schedule including weekends'
      ],
      benefits: [
        'Competitive commission structure',
        'Health, dental, and vision insurance',
        '401(k) with company match',
        'Paid time off',
        'Vehicle discounts',
        'Career growth potential'
      ]
    },
    {
      id: 5,
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Drive our digital presence and engage with luxury automotive enthusiasts. You will manage social media, email campaigns, and digital advertising.',
      responsibilities: [
        'Manage social media accounts',
        'Create engaging content',
        'Execute email marketing campaigns',
        'Monitor and analyze metrics',
        'Coordinate with design team',
        'Stay current with digital trends'
      ],
      requirements: [
        '3+ years digital marketing experience',
        'Experience with social media management',
        'Knowledge of email marketing platforms',
        'Analytical and creative mindset',
        'Excellent writing skills',
        'Photography/video skills a plus'
      ],
      benefits: [
        'Competitive salary',
        'Health, dental, and vision insurance',
        '401(k) with company match',
        'Flexible remote work',
        'Professional development',
        'Vehicle experience opportunities'
      ]
    },
    {
      id: 6,
      title: 'Fleet Coordinator',
      department: 'Operations',
      location: 'Westlands',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Coordinate our luxury vehicle fleet operations, including logistics, maintenance scheduling, and inventory management.',
      responsibilities: [
        'Schedule vehicle maintenance',
        'Coordinate vehicle movements',
        'Manage fleet documentation',
        'Track vehicle locations',
        'Coordinate with service team',
        'Maintain inventory records'
      ],
      requirements: [
        '2+ years fleet or logistics experience',
        'Excellent organizational skills',
        'Proficient in Excel and inventory software',
        'Valid driver\'s license',
        'Clean driving record',
        'Detail-oriented'
      ],
      benefits: [
        'Competitive salary',
        'Health, dental, and vision insurance',
        '401(k) with company match',
        'Paid time off',
        'Vehicle privileges',
        'Career advancement'
      ]
    }
  ];

  const departments = ['All', 'Service', 'Operations', 'Detailing', 'Sales', 'Marketing'];
  const locations = ['All', 'Roysambu (next to TRM)', 'Westlands', 'Upper Hill', 'Remote'];

  const [filters, setFilters] = useState({
    department: 'All',
    location: 'All',
    search: ''
  });

  const filteredJobs = jobs.filter(job => {
    const matchesDepartment = filters.department === 'All' || job.department === filters.department;
    const matchesLocation = filters.location === 'All' || job.location === filters.location;
    const matchesSearch = filters.search === '' || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesDepartment && matchesLocation && matchesSearch;
  });

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Handle application submission
    console.log('Application submitted:', { job: selectedJob, ...applicationData });
    setShowApplicationModal(false);
    // Show success message
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setApplicationData(prev => ({ ...prev, resume: file }));
  };

  return (
    <div className="careers-page">
      {/* Header */}
      <section className="careers-header">
        <div className="container">
          <h1 className="careers-title">
            Join the <span className="gold-text">CAR EASE</span> Team
          </h1>
          <p className="careers-subtitle">
            Build your career with the leader in luxury automotive services
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="why-join-section">
        <div className="container">
          <h2 className="section-title">Why Work With Us?</h2>
          <div className="benefits-grid">
            <Card className="benefit-card">
              <div className="benefit-icon">💪</div>
              <h3 className="benefit-title">Great Culture</h3>
              <p className="benefit-text">Collaborative, supportive environment with passionate automotive enthusiasts</p>
            </Card>
            <Card className="benefit-card">
              <div className="benefit-icon">📈</div>
              <h3 className="benefit-title">Growth Opportunities</h3>
              <p className="benefit-text">Clear career paths and professional development programs</p>
            </Card>
            <Card className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3 className="benefit-title">Competitive Compensation</h3>
              <p className="benefit-text">Excellent pay, bonuses, and comprehensive benefits package</p>
            </Card>
            <Card className="benefit-card">
              <div className="benefit-icon">🚗</div>
              <h3 className="benefit-title">Vehicle Privileges</h3>
              <p className="benefit-text">Employee discounts on rentals, services, and purchases</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="jobs-section">
        <div className="container">
          <h2 className="section-title">Current Openings</h2>

          {/* Filters */}
          <div className="jobs-filters">
            <select
              className="filter-select"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <div className="search-wrapper">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                icon="🔍"
              />
            </div>
          </div>

          {/* Job Listings */}
          <div className="jobs-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <Card key={job.id} className="job-card">
                  <div className="job-header">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-meta">
                        <span className="meta-item">📍 {job.location}</span>
                        <span className="meta-item">🏢 {job.department}</span>
                        <span className="meta-item">⏰ {job.type}</span>
                        <span className="meta-item">📅 {job.experience}</span>
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => handleApply(job)}>
                      Apply Now
                    </Button>
                  </div>
                  
                  <p className="job-description">{job.description}</p>
                  
                  <div className="job-details">
                    <div className="details-column">
                      <h4 className="details-title">Responsibilities</h4>
                      <ul className="details-list">
                        {job.responsibilities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="details-column">
                      <h4 className="details-title">Requirements</h4>
                      <ul className="details-list">
                        {job.requirements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="details-column">
                      <h4 className="details-title">Benefits</h4>
                      <ul className="details-list">
                        {job.benefits.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="no-jobs">
                <span className="no-jobs-icon">🔍</span>
                <h3>No positions match your criteria</h3>
                <p>Try adjusting your filters or check back later for new opportunities</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="culture-section">
        <div className="container">
          <div className="culture-content">
            <h2 className="culture-title">Our Culture</h2>
            <p className="culture-text">
              At CAR EASE, we're more than just a luxury automotive company – we're a family of passionate 
              enthusiasts dedicated to excellence. We believe in fostering an environment where creativity, 
              dedication, and teamwork thrive. Every team member plays a vital role in delivering exceptional 
              experiences to our discerning clientele.
            </p>
            <div className="culture-values">
              <div className="value-item">
                <span className="value-icon">✨</span>
                <span className="value-text">Excellence in everything we do</span>
              </div>
              <div className="value-item">
                <span className="value-icon">🤝</span>
                <span className="value-text">Integrity and transparency</span>
              </div>
              <div className="value-item">
                <span className="value-icon">💡</span>
                <span className="value-text">Innovation and continuous improvement</span>
              </div>
              <div className="value-item">
                <span className="value-icon">❤️</span>
                <span className="value-text">Passion for automobiles and service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={`Apply for ${selectedJob?.title}`}
        size="lg"
      >
        <form onSubmit={handleApplicationSubmit} className="application-form">
          <div className="form-row">
            <Input
              label="First Name"
              name="firstName"
              value={applicationData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={applicationData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Email"
              name="email"
              type="email"
              value={applicationData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={applicationData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="LinkedIn Profile (Optional)"
              name="linkedIn"
              value={applicationData.linkedIn}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <label className="file-label">
              <span className="file-label-text">Resume / CV *</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="file-input"
              />
              <span className="file-hint">PDF, DOC, or DOCX (Max 5MB)</span>
            </label>
          </div>

          <div className="form-row">
            <label className="textarea-label">Cover Letter</label>
            <textarea
              name="coverLetter"
              value={applicationData.coverLetter}
              onChange={handleInputChange}
              rows="5"
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              className="cover-letter"
            />
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowApplicationModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Equal Opportunity */}
      <div className="eoe-section">
        <div className="container">
          <p className="eoe-text">
            CAR EASE is an equal opportunity employer. We celebrate diversity and are committed to creating 
            an inclusive environment for all employees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Careers;
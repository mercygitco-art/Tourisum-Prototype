import ArrowIcon from './ArrowIcon'

const chapters = [
  // These chapters provide the editorial story sequence shown in the experience section.
  {
    number: '01',
    category: 'THE HIGHLANDS',
    title: <>Take the<br />long way.</>,
    description: 'Follow tea trails through the clouds. Let the old train set the pace.',
    image: '/images/ella.jpg',
    alt: 'The railway viaduct winding through the green hills near Ella',
    location: 'Ella · Hill Country',
  },
  {
    number: '02',
    category: 'THE WILD',
    title: <>A little<br />closer to wild.</>,
    description: 'Early light, quiet tracks, and the privilege of seeing wildlife on its terms.',
    image: '/images/elephants.jpg',
    alt: 'Sri Lankan elephants in their natural habitat',
    location: 'Yala · Southern Province',
  },
  {
    number: '03',
    category: 'THE COAST',
    title: <>Stay for<br />the last light.</>,
    description: 'Trade the timetable for salt air, warm water, and one more sunset.',
    image: '/images/mirissa.jpg',
    alt: 'The warm southern coastline at Mirissa',
    location: 'Mirissa · Southern Coast',
  },
]

function ExperienceSection() {
  return (
    <section className="experience-story" id="experiences" aria-labelledby="experience-title">
      <div className="experience-stage">
        <header className="experience-story-heading">
          <p className="eyebrow">The island, in three chapters</p>
          <h2 id="experience-title">Go where the day <em>takes you.</em></h2>
        </header>
        <div className="experience-track">
          {/* Each chapter combines one image, a location, and a route-planning prompt. */}
          {chapters.map((chapter) => (
            <article className="experience-chapter" key={chapter.number}>
              <figure className="experience-chapter-image">
                <img src={chapter.image} alt={chapter.alt} loading="lazy" />
                <figcaption>{chapter.location}</figcaption>
              </figure>
              <div className="experience-chapter-copy">
                <span className="experience-chapter-index">{chapter.number} / 03</span>
                <p className="eyebrow">{chapter.category}</p>
                <h3>{chapter.title}</h3>
                <p className="experience-chapter-description">{chapter.description}</p>
                <a className="text-link" href="#plan">
                  Shape this journey <ArrowIcon />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="experience-progress" aria-hidden="true">
          <span />
        </div>
        <p className="experience-scroll-hint">Keep scrolling to wander <span>↓</span></p>
      </div>
    </section>
  )
}

export default ExperienceSection

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const aboutMe = [
  registerContent('Tomohiro Tanaka (Tom)', '/img/logo.png',""),
  registerContent('', '', "I'm 600 years old like 'Master Yoda', and like coffee related technology and getting on a plane.")

]


const features = [
  registerContent(
    'Building Clusters Journey', '/docs/building_clusters_journey/0-intro',
    '/img/cluster_journey.png',
    "Showing how we build clusters which are related to BigData projects such as Apache Hadoop/Spark/Kafka/Hive and Presto."
  ),
  registerContent(
    'Tomohiro Tanaka (Tom)', 'https://www.linkedin.com/in/tomohiro-tanaka-bb186039/', '/img/tomtan_selfie.png',
    "Working as a cloud coffee engineer and having interests in BigData related projects. Just a Coffee Lover."
  ),
  registerContent(
    'My own wiki', null, '/img/broadcast_feature.png',
    "This is my own wiki that helps me for the future. It's super important to share knowledge inside my brain."
  ),
];



function registerContent(title, pageUrl, imageUrl, description) {
  /*
   * This function returns page contents based on columns.
   * params:
   *  title: The title of a content
   *  imageUrl: Image location for a content such as `/img/logo.png`.
   *  description: The description of content
  */
  var pageTitle = pageUrl ? <><a href={pageUrl}>{title}</a></> : <>{title}</>
  return({
    title: pageTitle,
    imageUrl: `${imageUrl}`,
    description:(<>{description}</>)
  })
}

// Show contents
function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h2><center>{title}</center></h2>
      <p><center>{description}</center></p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}!`}
      description="Expanding tomtan's knowledge about Apache Spark, Apache Kafka and related projects, and loving Coffee!<head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map(({title, imageUrl, description}) => (
                  <Feature
                    key={title}
                    title={title}
                    imageUrl={imageUrl}
                    description={description}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;

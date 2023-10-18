import React from "react";
import FACETS from "@/.canopy/facets.json";
import Layout from "@/components/layout";
import Hero from "@/components/Hero/Hero";
import Container from "@/components/Shared/Container";
import { createCollection } from "../services/iiif/constructors/collection";
import { HeroWrapper } from "../components/Hero/Hero.styled";
import Related from "../components/Related/Related";
import { getRelatedFacetValue } from "../services/iiif/constructors/related";
import Heading from "../components/Shared/Heading/Heading";
import Button from "../components/Shared/Button/Button";
import { ButtonWrapper } from "../components/Shared/Button/Button.styled";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { LocaleString } from "@/hooks/useLocale";
import { canopyManifests } from "@/services/constants/canopy";
import { CanopyEnvironment } from "@/types/canopy";
import { useCanopyState } from "@/context/canopy";

interface IndexProps {
  featured: any;
  collections: string[];
}

const Index: React.FC<IndexProps> = ({ featuredItem, collections }) => {
  const { canopyState } = useCanopyState();
  const {
    config: { baseUrl },
  } = canopyState;

  const hero = {
    ...featuredItem,
    items: featuredItem.items.map((item: any) => {
      return {
        ...item,
        thumbnail: [
          ...item.thumbnail.map((entry: any) => {
            return { ...entry, height: 1000, width: 1000 };
          }),
        ],
        homepage: [
          {
            id: `${baseUrl}/works/${item.homepage[0].id}`,
            type: "Text",
            label: item.label,
          },
        ],
      };
    }),
  };

  return (
    <Layout>
      <HeroWrapper>
        <Hero collection={hero} />
      </HeroWrapper>
      <Container>
        <Heading as="h2">Sobre a coleção</Heading>
        <div>
          <p>
          O acervo impressiona por indicar um ineditismo capaz de surpreender especialistas. 
          É o caso de Alexei Bueno, responsável pela seleção iconográfica e autor do texto que, 
          no livro, descreve as imagens e as situa ao longo de capítulos repletos de informação histórica. 
          “O conjunto mais significativo é o dedicado ao Morro do Castelo, antes, durante e depois 
          de sua destruição. As fotos têm uma luminosidade linda, parece que foram feitas hoje”, 
          explica o escritor. Berço da cidade, o morro foi posto abaixo, a jatos d’água, em obra 
          que ignorou preocupações maiores com a preservação da memória. 
          “Os ossos de todos os fundadores do Rio de Janeiro, heroicos companheiros de Estácio de Sá, 
          e os dos primeiros povoadores, que se encontravam todos, evidentemente, sepultados na Sé Velha 
          ou na Igreja dos Jesuítas, desceram junto com a lama” - Pedro Tinoco, Veja Rio, 2017
          </p>
        </div>
        <Related
          collections={collections}
          title={LocaleString("homepageHighlightedWorks")}
        />
      </Container>
    </Layout>
  );
};

export async function getStaticProps() {
  const manifests = canopyManifests();

  // @ts-ignore
  const { featured, metadata, baseUrl } = process.env
    ?.CANOPY_CONFIG as unknown as CanopyEnvironment;

  const randomFeaturedItem =
    manifests[Math.floor(Math.random() * manifests.length)];
  const featuredItem = await createCollection(
    featured ? featured : [randomFeaturedItem.id]
  );

  const collections = FACETS.map((facet) => {
    const value = getRelatedFacetValue(facet.label);
    return `${baseUrl}/api/facet/${facet.slug}/${value.slug}.json?sort=random`;
  });

  return {
    props: { metadata, featuredItem, collections },
    revalidate: 3600,
  };
}

export default Index;

import Blockquote from '../components/Blockquote';
import CodeBlock from '../components/CodeBlock';
import ExpansionPanel from '../components/ExpansionPanel';
import InlineCode from '../components/InlineCode';
import MultiCodeBlock, {
  MultiCodeBlockContext
} from '../components/MultiCodeBlock';
import PropTypes from 'prop-types';
import React, {Fragment, createElement} from 'react';
import RelativeLink, {PathContext} from '../components/RelativeLink';
import Sidebar, {SIDEBAR_WIDTH} from '../components/Sidebar';
import TableOfContents from '../components/TableOfContents';
import Wrapper from '../components/Wrapper';
import autolinkHeadings from 'rehype-autolink-headings';
import path, {dirname} from 'path';
import rehypeReact from 'rehype-react';
import {
  Box,
  Button,
  Divider,
  Fade,
  Flex,
  Heading,
  IconButton,
  ListItem,
  OrderedList,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  UnorderedList,
  useToken
} from '@chakra-ui/react';
import {FaDiscourse, FaGithub} from 'react-icons/fa';
import {FiChevronsRight, FiStar} from 'react-icons/fi';
import {GatsbySeo} from 'gatsby-plugin-next-seo';
import {Global} from '@emotion/react';
import {MDXProvider} from '@mdx-js/react';
import {MDXRenderer} from 'gatsby-plugin-mdx';
import {graphql} from 'gatsby';
import {rehype} from 'rehype';
import {useLocalStorage} from '@rehooks/local-storage';

const LIST_SPACING = 2;

const components = {
  h1: props => <Heading as="h1" size="3xl" {...props} />,
  h2: props => <Heading as="h2" size="2xl" {...props} />,
  h3: props => <Heading as="h3" size="xl" {...props} />,
  h4: props => <Heading as="h4" size="lg" {...props} />,
  h5: props => <Heading as="h5" size="md" {...props} />,
  h6: props => <Heading as="h6" size="sm" {...props} />,
  ul: props => <UnorderedList spacing={LIST_SPACING} {...props} />,
  ol: props => <OrderedList spacing={LIST_SPACING} {...props} />,
  li: ListItem,
  p: Text,
  a: RelativeLink,
  pre: CodeBlock,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  blockquote: Blockquote
};

const mdxComponents = {
  ...components,
  wrapper: Wrapper,
  inlineCode: InlineCode,
  Button,
  ExpansionPanel,
  MultiCodeBlock
};

const {processSync} = rehype()
  .data('settings', {fragment: true})
  .use(autolinkHeadings, {behavior: 'wrap'})
  .use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      ...components,
      code: InlineCode
    }
  });

export default function PageTemplate({data, uri, pageContext}) {
  const [scrollPaddingTop, tocPaddingBottom] = useToken('space', [12, 4]);
  const [language, setLanguage] = useLocalStorage('language');
  const [sidebarHidden, setSidebarHidden] = useLocalStorage('sidebar');

  const {siteUrl} = data.site.siteMetadata;
  const {
    name,
    childMdx,
    childMarkdownRemark,
    sourceInstanceName,
    gitRemote,
    relativePath
  } = data.file;
  const {frontmatter, headings} = childMdx || childMarkdownRemark;
  const {title, description, standalone} = frontmatter;

  const content = (
    <MultiCodeBlockContext.Provider value={{language, setLanguage}}>
      <PathContext.Provider value={name === 'index' ? uri : dirname(uri)}>
        {childMdx ? (
          <MDXProvider components={mdxComponents}>
            <MDXRenderer>{childMdx.body}</MDXRenderer>
          </MDXProvider>
        ) : (
          <Wrapper>{processSync(childMarkdownRemark.html).result}</Wrapper>
        )}
      </PathContext.Provider>
    </MultiCodeBlockContext.Provider>
  );

  return (
    <>
      <GatsbySeo
        title={title}
        description={description}
        canonical={siteUrl + uri}
        openGraph={{
          title,
          description
        }}
      />
      <Global
        styles={{
          html: {
            scrollPaddingTop
          }
        }}
      />
      {standalone ? (
        content
      ) : (
        <>
          <Fade in={sidebarHidden} unmountOnExit delay={0.25}>
            <Tooltip placement="right" label="Show sidebar">
              <IconButton
                pos="fixed"
                top="2"
                left="2"
                size="sm"
                isRound
                fontSize="lg"
                icon={<FiChevronsRight />}
                onClick={() => setSidebarHidden(false)}
              />
            </Tooltip>
          </Fade>
          <Sidebar
            {...pageContext}
            uri={uri}
            basePath={sourceInstanceName}
            isHidden={sidebarHidden}
            onHide={() => setSidebarHidden(true)}
          />
          <Box
            ml={!sidebarHidden && SIDEBAR_WIDTH}
            transition="margin-left 250ms"
          >
            <Flex maxW="6xl" align="flex-start" px="10" py="12" as="main">
              <Box flexGrow="1" w="0">
                <Heading size="3xl">{title}</Heading>
                {description && (
                  <Heading mt="4" fontWeight="normal">
                    {description}
                  </Heading>
                )}
                <Divider my="8" />
                {content}
              </Box>
              <Flex
                direction="column"
                as="aside"
                ml="10"
                w="250px"
                flexShrink="0"
                pos="sticky"
                top={scrollPaddingTop}
                pb={tocPaddingBottom}
                maxH={`calc(100vh - ${scrollPaddingTop} - ${tocPaddingBottom})`}
              >
                <Heading size="md" mb="3">
                  {title}
                </Heading>
                <TableOfContents headings={headings} />
                <Stack align="flex-start" spacing="3" mt="8">
                  <Button
                    onClick={() => window.freddyWidget?.show()}
                    variant="link"
                    size="lg"
                    leftIcon={<FiStar />}
                  >
                    Rate article
                  </Button>
                  {gitRemote && (
                    <Button
                      as="a"
                      href={[
                        gitRemote.href,
                        'tree',
                        gitRemote.ref,
                        relativePath
                      ].join(path.sep)}
                      variant="link"
                      size="lg"
                      leftIcon={<FaGithub />}
                    >
                      Edit on GitHub
                    </Button>
                  )}
                  <Button
                    as="a"
                    href="https://community.apollographql.com/"
                    variant="link"
                    size="lg"
                    leftIcon={<FaDiscourse />}
                  >
                    Discuss in forums
                  </Button>
                </Stack>
              </Flex>
            </Flex>
          </Box>
        </>
      )}
    </>
  );
}

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  pageContext: PropTypes.object.isRequired
};

export const pageQuery = graphql`
  query GetPage($id: String!) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    file(id: {eq: $id}) {
      name
      sourceInstanceName
      relativePath
      gitRemote {
        href
        ref
      }
      childMdx {
        body
        headings {
          depth
          value
        }
        frontmatter {
          title
          description
          standalone
        }
      }
      childMarkdownRemark {
        html
        htmlAst
        headings {
          depth
          value
        }
        frontmatter {
          title
          description
        }
      }
    }
  }
`;

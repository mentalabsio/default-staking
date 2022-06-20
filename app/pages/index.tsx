/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Text } from "@theme-ui/components"
import { useState } from "react"

import Header from "@/components/Header/Header"
import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import useStaking from "@/hooks/useStaking"
import { LoadingIcon } from "@/components/icons/LoadingIcon"
export default function Home() {
  const { walletNFTs, fetchNFTs } = useWalletNFTs()
  const [selectedWalletItems, setSelectedWalletItems] = useState<NFT[]>([])
  const [selectedVaultItems, setSelectedVaultItems] = useState<NFT[]>([])

  const {
    farmerAccount,
    initFarmer,
    stakeAll,
    claim,
    stakeReceipts,
    feedbackStatus,
    unstakeAll,
    fetchReceipts,
  } = useStaking()

  /**
   * Handles selected items.
   */
  const handleWalletItemClick = (item: NFT) => {
    setSelectedWalletItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev.length < 4 ? prev?.concat(item) : prev
    })
  }

  const handleVaultItemClick = (item: NFT) => {
    setSelectedVaultItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev.length < 4 ? prev?.concat(item) : prev
    })
  }

  const orderedReceipts =
    stakeReceipts &&
    stakeReceipts.sort((a, b) =>
      a.startTs.toNumber() < b.startTs.toNumber() ? 1 : -1
    )

  return (
    <>
      <Head>
        <title>Staking</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div
        sx={{
          "&:before": {
            content: "''",
            backgroundRepeat: "repeat",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
            opacity: 0.4,
            zIndex: 0,
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundPosition: "50% 0",
            pointerEvents: "none",
          },
        }}
      ></div>

      <main
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
          margin: "0 auto",
          marginTop: "4rem",
          maxWidth: "78rem",
          position: "relative",
          padding: "0 1.6rem",
          minHeight: "60vh",
        }}
      >
        <Heading mb=".8rem" variant="heading1">
          Staking
        </Heading>
        <Text>Stake your NFTs now</Text>

        {farmerAccount === false ? (
          <>
            <Button mt="3.2rem" onClick={initFarmer}>
              Init account
            </Button>
            <Flex
              sx={{
                alignItems: "center",
                gap: ".8rem",
                margin: ".8rem 0",
              }}
            >
              {feedbackStatus ? (
                <>
                  {feedbackStatus.indexOf("Success") === -1 ? (
                    <LoadingIcon size="1.6rem" />
                  ) : null}
                  {"  "}{" "}
                  <Text
                    variant="small"
                    sx={{
                      color:
                        feedbackStatus.indexOf("Success") !== -1
                          ? "success"
                          : "text",
                    }}
                  >
                    {feedbackStatus}
                  </Text>
                </>
              ) : (
                ""
              )}
              &nbsp;
            </Flex>
          </>
        ) : null}

        {farmerAccount ? (
          <>
            <Flex
              my="3.2rem"
              sx={{
                flexDirection: "column",
                alignItems: "center",
                gap: "1.6rem",
              }}
            >
              <Flex
                sx={{
                  gap: "1.6rem",
                }}
              >
                {/* {farmerAccount.accruedRewards.toNumber() ? (
                  <Text>
                    Rewards:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        farmerAccount.accruedRewards.toNumber() / 1000000
                      ).toFixed(2)}
                    </b>
                  </Text>
                ) : null} */}

                {/* {farmerAccount?.totalRewardRate?.toNumber() ? (
                  <Text>
                    Rate:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        (farmerAccount?.totalRewardRate?.toNumber() / 1000000) *
                        86400
                      ).toFixed(2)}{" "}
                    </b>
                    per day
                  </Text>
                ) : null} */}
              </Flex>
              <Button onClick={claim}>Claim rewards</Button>

              <Flex
                sx={{
                  alignItems: "center",
                  gap: ".8rem",
                  margin: ".8rem 0",
                }}
              >
                {feedbackStatus ? (
                  <>
                    {feedbackStatus.indexOf("Success") === -1 ? (
                      <LoadingIcon size="1.6rem" />
                    ) : null}
                    {"  "}{" "}
                    <Text
                      variant="small"
                      sx={{
                        color:
                          feedbackStatus.indexOf("Success") !== -1
                            ? "success"
                            : "text",
                      }}
                    >
                      {feedbackStatus}
                    </Text>
                  </>
                ) : (
                  ""
                )}
                &nbsp;
              </Flex>
            </Flex>

            <Flex
              my="3.2rem"
              sx={{
                flexDirection: "column",
                gap: "1.6rem",
                alignSelf: "stretch",
              }}
            >
              <Tabs
                sx={{
                  margin: "3.2rem 0",
                  alignSelf: "stretch",
                  minHeight: "48rem",
                }}
              >
                <TabList>
                  <Tab>Your wallet</Tab>
                  <Tab>Your vault</Tab>
                </TabList>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Heading variant="heading2">Your wallet NFTs</Heading>
                    <Button
                      onClick={async (e) => {
                        const allMints = selectedWalletItems.map(
                          (item) => item.mint
                        )
                        await stakeAll(allMints)
                        await fetchNFTs()
                        await fetchReceipts()
                        setSelectedWalletItems([])
                      }}
                      disabled={!selectedWalletItems.length}
                    >
                      Stake selected
                    </Button>
                  </Flex>
                  <NFTGallery NFTs={walletNFTs}>
                    <>
                      {walletNFTs?.map((item) => {
                        const isSelected = selectedWalletItems.find(
                          (NFT) =>
                            NFT.onchainMetadata.mint ===
                            item.onchainMetadata.mint
                        )

                        return (
                          <Flex
                            sx={{
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1.6rem",
                            }}
                          >
                            <CollectionItem
                              key={item.onchainMetadata.mint}
                              item={item}
                              onClick={handleWalletItemClick}
                              sx={{
                                maxWidth: "16rem",
                                "> img": {
                                  border: "3px solid transparent",
                                  borderColor: isSelected
                                    ? "primary"
                                    : "transparent",
                                },
                              }}
                            />
                          </Flex>
                        )
                      })}
                    </>
                  </NFTGallery>
                </TabPanel>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Heading variant="heading2">Your vault NFTs</Heading>
                    <Button
                      onClick={async (e) => {
                        const allMints = selectedVaultItems.map(
                          (item) => item.mint
                        )
                        await unstakeAll(allMints)
                        await fetchNFTs()
                        await fetchReceipts()
                        setSelectedVaultItems([])
                      }}
                      disabled={!selectedVaultItems.length}
                    >
                      Unstake selected
                    </Button>
                  </Flex>
                  <Flex
                    sx={{
                      flexDirection: "column",
                      gap: "1.6rem",

                      "@media (min-width: 768px)": {
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      },
                    }}
                  >
                    {orderedReceipts &&
                      orderedReceipts.map((stake) => {
                        const isSelected = selectedVaultItems.find(
                          (NFT) =>
                            NFT.onchainMetadata.mint ===
                            stake.metadata.onchainMetadata.mint
                        )

                        return (
                          <Flex
                            key={stake.mint?.toString()}
                            sx={{
                              background: "background",
                              padding: "1.6rem",
                              borderRadius: ".4rem",
                              flexDirection: "column",
                              position: "relative",
                              justifyContent: "center",

                              "@media (min-width:768px)": {
                                flexDirection: "row",
                              },
                            }}
                          >
                            <Flex
                              sx={{
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "1.6rem",
                              }}
                            >
                              <CollectionItem
                                sx={{
                                  maxWidth: "16rem",
                                  "> img": {
                                    border: "3px solid transparent",
                                    borderColor: isSelected
                                      ? "primary"
                                      : "transparent",
                                  },
                                }}
                                onClick={handleVaultItemClick}
                                item={stake.metadata}
                              />
                              {/* <Flex
                                sx={{
                                  gap: "1.6rem",
                                  alignItems: "center",
                                  flexDirection: "column",
                                  marginTop: "1.6rem",
                                }}
                              >
                                <Button variant="resetted">Unstake</Button>
                              </Flex> */}
                            </Flex>
                          </Flex>
                        )
                      })}
                  </Flex>
                </TabPanel>
              </Tabs>

              {/* <Flex
            sx={{
              flexDirection: "column",
              gap: ".8rem",
            }}
          >
            <Heading variant="heading3">NFT Selector:</Heading>
            <NFTSelectInput name="nft" NFTs={walletNFTs} />
          </Flex> */}
            </Flex>
          </>
        ) : null}
      </main>

      <footer
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "4rem 0",
          // marginTop: "32rem",
          position: "relative",
        }}
      >
        <a
          href="https://twitter.com/magicshards"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Text
            variant="small"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              sx={{
                height: "32px",
              }}
              src="/magicshards320px.gif"
              alt="Magic Shards"
              height={32}
            />
          </Text>
        </a>
      </footer>
    </>
  )
}

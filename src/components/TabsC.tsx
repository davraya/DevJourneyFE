import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

const TabsC = () => {
    return(
        <Tabs>
            <TabList>
                <Tab>Tab 1</Tab>
                <Tab>Tab 2</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <p>Tab 1 Content</p>
                </TabPanel>
                <TabPanel>
                    <p>Tab 2 Content</p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default TabsC;
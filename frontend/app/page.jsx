"use client";

import React from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ExplorerProvider } from "./context/ExplorerContext";
import { CollaborativeProvider } from "./context/CollaboratorContext";
import { EditorUIProvider, useEditorUI } from "./context/EditorUIContext";
import Menubar from "./components/Menubar";
import Activitybar from "./components/Activitybar";
import Sidebar from "./components/Sidebar";
import TabBar from "./components/TabBar";
import EditorArea from "./components/EditorArea";
import Output from "./components/Output";

function MainLayout() {
  const { sidebarOpen, setIsOutputVisible, isOutputVisible } = useEditorUI();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1e1e] text-white overflow-hidden select-none font-sans">
      {/* Top Menu Bar */}
      <Menubar />

      {/* Main Workspace */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Fixed Width Activity Bar on the very left */}
        <Activitybar />

        {/* Resizable Panel Group */}
        <PanelGroup direction="horizontal" className="flex-1">
          {sidebarOpen && (
            <>
              {/* Sidebar Panel */}
              <Panel
                id="sidebar-panel"
                order={1}
                defaultSize={250}
              >
                <Sidebar />
              </Panel>

              {/* Styled Resize Handle */}
              {/* <PanelResizeHandle className="w-1 bg-[#2b2b3c] hover:bg-sky-500 active:bg-sky-400 transition-colors cursor-col-resize duration-150 relative z-30" /> */}
            </>
          )}

          {/* Editor Panel (takes the remaining width) */}
          <Panel id="editor-panel" order={2} defaultSize={950}>
            <div className="flex flex-col h-full w-full overflow-hidden">
              <TabBar />
              <div className="flex-1 w-full overflow-hidden relative">
                {isOutputVisible ? (
                  <PanelGroup direction="vertical">
                    <Panel id="editor-area-panel" defaultSize={70} minSize={30}>
                      <EditorArea />
                    </Panel>
                    <PanelResizeHandle className="h-1 bg-[#2b2b3c] hover:bg-sky-500 active:bg-sky-400 transition-colors cursor-row-resize duration-150 relative z-30" />
                    <Panel id="output-panel" defaultSize={30} minSize={15}>
                      <Output onClose={() => setIsOutputVisible(false)} />
                    </Panel>
                  </PanelGroup>
                ) : (
                  <EditorArea />
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ExplorerProvider>
      <CollaborativeProvider>
        <EditorUIProvider>
          <MainLayout />
        </EditorUIProvider>
      </CollaborativeProvider>
    </ExplorerProvider>
  );
}

import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DriveAttachment from "./DriveAttachment";
import { resolveTabs, TAB_CONFIG } from "./tabConfig";

const driveRecord = {
  uid: "d1",
  name: "brief.pdf",
  size: 2048,
  status: "success",
  source: "drive",
  driveNodeId: "node-1",
};

const renderDrive = jest.fn(({ selectedIds }) => (
  <div data-testid="builtin-drive">{selectedIds.join(",")}</div>
));

const tabNames = () => screen.getAllByRole("tab").map((t) => t.textContent);

describe("DriveAttachment", () => {
  let warnSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warnSpy.mockRestore());

  describe("existing behaviour (no tabConfigInfo)", () => {
    it("renders the built-in Upload and Drive tabs, Upload first", () => {
      render(<DriveAttachment renderDrive={renderDrive} />);
      expect(tabNames()).toEqual(["Upload", "Drive"]);
      expect(screen.getByTestId("drive-attachment-dropzone")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Drive" }));
      expect(screen.getByTestId("builtin-drive")).toBeInTheDocument();
    });

    it("opens on Drive when records exist at mount, or on defaultTab", () => {
      const { unmount } = render(
        <DriveAttachment uploadRecords={[driveRecord]} renderDrive={renderDrive} />
      );
      expect(screen.getByTestId("builtin-drive")).toHaveTextContent("node-1");
      unmount();
      render(<DriveAttachment defaultTab="drive" renderDrive={renderDrive} />);
      expect(screen.getByTestId("builtin-drive")).toBeInTheDocument();
    });

    it("reports picked files and shows the selected-files list", () => {
      const onFilesAdded = jest.fn();
      render(
        <DriveAttachment uploadRecords={[driveRecord]} onFilesAdded={onFilesAdded} defaultTab="upload" />
      );
      const file = new File(["x"], "a.txt", { type: "text/plain" });
      fireEvent.change(screen.getByTestId("drive-attachment-file-input"), {
        target: { files: [file] },
      });
      expect(onFilesAdded).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Selected files (1)")).toBeInTheDocument();
    });

    it("contains a Drive failure to the Drive tab and retries it", () => {
      const onDriveRetry = jest.fn();
      const onDriveError = jest.fn();
      jest.spyOn(console, "error").mockImplementation(() => {});
      let fail = true;
      const Drive = () => {
        if (fail) throw new Error("remote down");
        return <div data-testid="builtin-drive" />;
      };
      render(
        <DriveAttachment
          defaultTab="drive"
          renderDrive={() => <Drive />}
          onDriveRetry={onDriveRetry}
          onDriveError={onDriveError}
        />
      );
      expect(screen.getByTestId("drive-attachment-drive-error")).toHaveTextContent(
        "Drive is unavailable right now."
      );
      expect(onDriveError).toHaveBeenCalled();
      fail = false;
      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(onDriveRetry).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("builtin-drive")).toBeInTheDocument();
      console.error.mockRestore();
    });

    it("falls back to the first tab when the active tab is removed", () => {
      const { rerender } = render(
        <DriveAttachment tabs={["upload", "drive"]} defaultTab="drive" renderDrive={renderDrive} />
      );
      expect(screen.getByTestId("builtin-drive")).toBeInTheDocument();
      rerender(<DriveAttachment tabs={["upload"]} renderDrive={renderDrive} />);
      expect(screen.getByTestId("drive-attachment-dropzone")).toBeInTheDocument();
      // Re-adding Drive doesn't jump back to it.
      rerender(<DriveAttachment tabs={["upload", "drive"]} renderDrive={renderDrive} />);
      expect(screen.getByTestId("drive-attachment-dropzone")).toBeInTheDocument();
    });
  });

  describe("tabConfigInfo", () => {
    it("overrides label/icon of a built-in tab but keeps its built-in content", () => {
      render(
        <DriveAttachment
          renderDrive={renderDrive}
          tabConfigInfo={{ drive: { label: "My Drive", icon: <span data-testid="custom-icon" /> } }}
        />
      );
      expect(tabNames()).toEqual(["Upload", "My Drive"]);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "My Drive" }));
      expect(screen.getByTestId("builtin-drive")).toBeInTheDocument();
    });

    it("replaces built-in content when a component is given", () => {
      const CustomUpload = ({ uploadRecords, hint }) => (
        <div data-testid="custom-upload">{`${uploadRecords.length}-${hint}`}</div>
      );
      const CustomDrive = () => <div data-testid="custom-drive" />;
      render(
        <DriveAttachment
          uploadRecords={[driveRecord]}
          defaultTab="upload"
          renderDrive={renderDrive}
          tabConfigInfo={{
            upload: { component: CustomUpload, props: { hint: "h" } },
            drive: { component: CustomDrive },
          }}
        />
      );
      expect(screen.getByTestId("custom-upload")).toHaveTextContent("1-h");
      expect(screen.queryByTestId("drive-attachment-dropzone")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Drive" }));
      expect(screen.getByTestId("custom-drive")).toBeInTheDocument();
      expect(renderDrive).not.toHaveBeenCalled();
    });

    it("renders custom tabs in `tabs` order with the shared tab context", () => {
      const ProjectTab = ({ onDriveFilesSelected, driveSelectedIds, setActiveTab }) => (
        <div>
          <span data-testid="project-selected">{driveSelectedIds.join(",")}</span>
          <button type="button" onClick={() => onDriveFilesSelected([{ id: "p1" }])}>
            add
          </button>
          <button type="button" onClick={() => setActiveTab("upload")}>
            go upload
          </button>
        </div>
      );
      const ComposeTab = () => <div data-testid="compose" />;
      const onDriveFilesSelected = jest.fn();
      render(
        <DriveAttachment
          tabs={["upload", "project", "drive", "compose"]}
          uploadRecords={[driveRecord]}
          defaultTab="project"
          renderDrive={renderDrive}
          onDriveFilesSelected={onDriveFilesSelected}
          tabConfigInfo={{
            project: { label: "Project", component: ProjectTab },
            compose: { component: ComposeTab },
          }}
        />
      );
      // Missing label falls back to the capitalized id.
      expect(tabNames()).toEqual(["Upload", "Project", "Drive", "Compose"]);
      expect(screen.getByTestId("project-selected")).toHaveTextContent("node-1");
      fireEvent.click(screen.getByRole("button", { name: "add" }));
      expect(onDriveFilesSelected).toHaveBeenCalledWith([{ id: "p1" }]);
      fireEvent.click(screen.getByRole("button", { name: "go upload" }));
      expect(screen.getByTestId("drive-attachment-dropzone")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Compose" }));
      expect(screen.getByTestId("compose")).toBeInTheDocument();
    });

    it("skips a custom tab that has no component", () => {
      render(
        <DriveAttachment
          tabs={["upload", "project", "drive"]}
          tabConfigInfo={{ project: { label: "Project" } }}
        />
      );
      expect(tabNames()).toEqual(["Upload", "Drive"]);
      expect(warnSpy).toHaveBeenCalled();
    });

    it("contains a crashing custom tab and retries it", () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      const onRetry = jest.fn();
      const onError = jest.fn();
      let fail = true;
      const ProjectTab = () => {
        if (fail) throw new Error("boom");
        return <div data-testid="project" />;
      };
      render(
        <DriveAttachment
          tabs={["upload", "project"]}
          uploadRecords={[{ ...driveRecord, source: "local" }]}
          defaultTab="project"
          tabConfigInfo={{
            project: { component: ProjectTab, errorMessage: "Projects down", onRetry, onError },
          }}
        />
      );
      expect(screen.getByTestId("drive-attachment-tab-error-project")).toHaveTextContent(
        "Projects down"
      );
      expect(onError).toHaveBeenCalled();
      // The rest of the field keeps working.
      expect(screen.getByText("Selected files (1)")).toBeInTheDocument();
      fail = false;
      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("project")).toBeInTheDocument();
      console.error.mockRestore();
    });

    it("keeps a custom tab's state across parent re-renders", () => {
      const Counter = () => {
        const [n, setN] = useState(0);
        return (
          <button type="button" onClick={() => setN(n + 1)}>
            {`count ${n}`}
          </button>
        );
      };
      const config = { project: { component: Counter } };
      const { rerender } = render(
        <DriveAttachment tabs={["project"]} tabConfigInfo={config} />
      );
      fireEvent.click(screen.getByRole("button", { name: "count 0" }));
      rerender(<DriveAttachment tabs={["project"]} tabConfigInfo={config} uploadRecords={[]} />);
      expect(screen.getByRole("button", { name: "count 1" })).toBeInTheDocument();
    });
  });

  describe("resolveTabs", () => {
    it("returns TAB_CONFIG unchanged without overrides, dropping unknowns and duplicates", () => {
      const resolved = resolveTabs(["upload", "drive", "drive", "nope"]);
      expect(resolved.map((t) => t.id)).toEqual(["upload", "drive"]);
      expect(resolved[1]).toMatchObject({ ...TAB_CONFIG.drive, id: "drive" });
    });

    it("ignores tabConfigInfo keys not listed in tabs", () => {
      const resolved = resolveTabs(["upload"], { drive: { label: "X" } });
      expect(resolved.map((t) => t.id)).toEqual(["upload"]);
    });
  });
});

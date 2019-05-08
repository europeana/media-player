interface Window {
    manifestCallback: any;
}
interface JQueryXHR {
    setRequestHeader: (name: string, value: string) => void;
}
declare function escape(s: string): string;
declare function unescape(s: string): string;

declare namespace Manifold {
    class StringValue {
        value: string;
        constructor(value?: string);
        toString(): string;
    }
}

declare namespace Manifold {
    class TreeSortType extends StringValue {
        static DATE: TreeSortType;
        static NONE: TreeSortType;
        date(): TreeSortType;
        none(): TreeSortType;
    }
}

declare namespace Manifold {
    class AnnotationGroup {
        canvasIndex: number;
        rects: AnnotationRect[];
        constructor(resource: any, canvasIndex: number);
        addRect(resource: any): void;
    }
}

declare namespace Manifold {
    class AnnotationRect {
        canvasIndex: number;
        chars: string;
        height: number;
        index: number;
        isVisible: boolean;
        viewportX: number;
        viewportY: number;
        width: number;
        x: number;
        y: number;
        constructor(result: any);
    }
}

declare namespace Manifold {
    class Bootstrapper {
        private _options;
        constructor(options: Manifold.IManifoldOptions);
        bootstrap(res?: (helper: IHelper) => void, rej?: (error: any) => void): Promise<Manifold.IHelper>;
        private _loaded(bootstrapper, json, resolve, reject);
        private _detectIE();
    }
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    class ExternalResource implements Manifesto.IExternalResource {
        authAPIVersion: number;
        authHoldingPage: any;
        clickThroughService: Manifesto.IService | null;
        data: any;
        dataUri: string | null;
        error: any;
        externalService: Manifesto.IService | null;
        height: number;
        index: number;
        isProbed: boolean;
        isResponseHandled: boolean;
        kioskService: Manifesto.IService | null;
        loginService: Manifesto.IService | null;
        logoutService: Manifesto.IService | null;
        probeService: Manifesto.IService | null;
        restrictedService: Manifesto.IService | null;
        status: number;
        tokenService: Manifesto.IService | null;
        width: number;
        constructor(canvas: Manifesto.ICanvas, options: Manifesto.IExternalResourceOptions);
        private _getImageServiceDescriptor(services);
        private _getDataUri(canvas);
        private _parseAuthServices(resource);
        private _parseDimensions(canvas);
        isAccessControlled(): boolean;
        hasServiceDescriptor(): boolean;
        getData(accessToken?: Manifesto.IAccessToken): Promise<Manifesto.IExternalResource>;
    }
}

/// <reference types="manifesto.js" />
declare type NullableTreeNode = Manifold.ITreeNode | null;
declare namespace Manifold {
    class Helper implements IHelper {
        private _multiSelectState;
        canvasIndex: number;
        collectionIndex: number;
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        manifestIndex: number;
        options: IManifoldOptions;
        sequenceIndex: number;
        rangeId: string | null;
        constructor(options: IManifoldOptions);
        getAutoCompleteService(): Manifesto.IService | null;
        getAttribution(): string | null;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas | null;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasIndexById(id: string): number | null;
        getCanvasIndexByLabel(label: string): number;
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange | null;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number | null;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentSequence(): Manifesto.ISequence;
        getDescription(): string | null;
        getFirstPageIndex(): number;
        getLabel(): string | null;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string | null;
        getLogo(): string | null;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(options?: MetadataOptions): MetadataGroup[];
        getRequiredStatement(): ILabelValuePair | null;
        private _parseMetadataOptions(options, metadataGroups);
        private _getRangeMetadata(metadataGroups, range);
        getMultiSelectState(): Manifold.MultiSelectState;
        getCurrentRange(): Manifesto.IRange | null;
        getPosterCanvas(): Manifesto.ICanvas | null;
        getPosterImage(): string | null;
        getPreviousRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getNextRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getFlattenedTree(): ITreeNode[];
        private _flattenTree(root, key);
        getRanges(): IRange[];
        getRangeByPath(path: string): Manifesto.IRange | null;
        getRangeById(id: string): Manifesto.IRange | null;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRelated(): any;
        getSearchService(): Manifesto.IService | null;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string | null;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        private _getTopRanges();
        getTree(topRangeIndex?: number, sortType?: TreeSortType): NullableTreeNode;
        treeHasNavDates(tree: ITreeNode): boolean;
        getViewingDirection(): Manifesto.ViewingDirection | null;
        getViewingHint(): Manifesto.ViewingHint | null;
        hasParentCollection(): boolean;
        hasRelatedPage(): boolean;
        hasResources(): boolean;
        isBottomToTop(): boolean;
        isCanvasIndexOutOfRange(index: number): boolean;
        isContinuous(): boolean;
        isFirstCanvas(index?: number): boolean;
        isHorizontallyAligned(): boolean;
        isLastCanvas(index?: number): boolean;
        isLeftToRight(): boolean;
        isMultiCanvas(): boolean;
        isMultiSequence(): boolean;
        isPaged(): boolean;
        isPagingAvailable(): boolean;
        isPagingEnabled(): boolean;
        isRightToLeft(): boolean;
        isTopToBottom(): boolean;
        isTotalCanvasesEven(): boolean;
        isUIEnabled(name: string): boolean;
        isVerticallyAligned(): boolean;
        createDateNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createDecadeNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createMonthNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createYearNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        getDecadeNode(rootNode: ITreeNode, year: number): ITreeNode | null;
        getMonthNode(yearNode: ITreeNode, month: Number): ITreeNode | null;
        getNodeDisplayDate(node: ITreeNode): string;
        getNodeDisplayMonth(node: ITreeNode): string;
        getNodeMonth(node: ITreeNode): number;
        getNodeYear(node: ITreeNode): number;
        getYearNode(decadeNode: ITreeNode, year: Number): ITreeNode | null;
        pruneDecadeNodes(rootNode: ITreeNode): void;
        sortDecadeNodes(rootNode: ITreeNode): void;
        sortMonthNodes(rootNode: ITreeNode): void;
        sortYearNodes(rootNode: ITreeNode): void;
    }
}

declare namespace Manifold {
    interface ICanvas extends IMultiSelectable, Manifesto.ICanvas {
    }
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    interface IHelper {
        canvasIndex: number;
        collectionIndex: number;
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        manifestIndex: number;
        options: IManifoldOptions;
        sequenceIndex: number;
        rangeId: string | null;
        getAttribution(): string | null;
        getAutoCompleteService(): Manifesto.IService | null;
        getCanvasById(id: string): Manifesto.ICanvas | null;
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasIndexById(id: string): number | null;
        getCanvasIndexByLabel(label: string): number;
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange | null;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number | null;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentRange(): Manifesto.IRange | null;
        getCurrentSequence(): Manifesto.ISequence;
        getDescription(): string | null;
        getFirstPageIndex(): number;
        getFlattenedTree(): ITreeNode[];
        getLabel(): string | null;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string | null;
        getLogo(): string | null;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(options?: MetadataOptions): Manifold.MetadataGroup[];
        getMultiSelectState(): Manifold.MultiSelectState;
        getNextRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getPosterCanvas(): Manifesto.ICanvas | null;
        getPosterImage(): string | null;
        getPreviousRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getRangeById(id: string): Manifesto.IRange | null;
        getRangeByPath(path: string): Manifesto.IRange | null;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRanges(): IRange[];
        getRelated(): any;
        getRequiredStatement(): ILabelValuePair | null;
        getSearchService(): Manifesto.IService | null;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string | null;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(topRangeIndex?: number, sortType?: TreeSortType): NullableTreeNode;
        getViewingDirection(): Manifesto.ViewingDirection | null;
        getViewingHint(): Manifesto.ViewingHint | null;
        hasParentCollection(): boolean;
        hasRelatedPage(): boolean;
        hasResources(): boolean;
        isBottomToTop(): boolean;
        isCanvasIndexOutOfRange(index: number): boolean;
        isContinuous(): boolean;
        isFirstCanvas(index?: number): boolean;
        isHorizontallyAligned(): boolean;
        isLastCanvas(index?: number): boolean;
        isLeftToRight(): boolean;
        isMultiCanvas(): boolean;
        isMultiSequence(): boolean;
        isPaged(): boolean;
        isPagingAvailable(): boolean;
        isPagingEnabled(): boolean;
        isRightToLeft(): boolean;
        isTopToBottom(): boolean;
        isTotalCanvasesEven(): boolean;
        isUIEnabled(name: string): boolean;
        isVerticallyAligned(): boolean;
        treeHasNavDates(tree: ITreeNode): boolean;
    }
}

declare namespace Manifold {
    class ILabelValuePair {
        label: string | null;
        value: string | null;
    }
}

interface IManifold {
    loadManifest: (options: Manifold.IManifoldOptions) => Promise<Manifold.IHelper>;
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    interface IManifoldOptions {
        iiifResourceUri: string;
        iiifResource: Manifesto.IIIIFResource;
        locale: string;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
        rangeId: string | null;
    }
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    interface IMetadataItem extends Manifesto.LabelValuePair {
        isRootLevel: boolean;
    }
}

declare namespace Manifold {
    interface IMultiSelectable {
        multiSelected: boolean;
        multiSelectEnabled: boolean;
    }
}

declare namespace Manifold {
    interface IRange extends IMultiSelectable, Manifesto.IRange {
    }
}

declare namespace Manifold {
    interface IThumb extends IMultiSelectable, Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
    }
}

declare namespace Manifold {
    interface ITreeNode extends IMultiSelectable, Manifesto.ITreeNode {
    }
}

declare namespace Manifold {
    function loadManifest(options: Manifold.IManifoldOptions): Promise<IHelper>;
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    class MetadataGroup {
        resource: Manifesto.IManifestResource;
        label: string | undefined;
        items: Manifold.IMetadataItem[];
        constructor(resource: Manifesto.IManifestResource, label?: string);
        addItem(item: Manifold.IMetadataItem): void;
        addMetadata(metadata: Manifesto.LabelValuePair[], isRootLevel?: boolean): void;
    }
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    class MetadataOptions {
        canvases: Manifesto.ICanvas[];
        licenseFormatter: Manifold.UriLabeller;
        range: Manifesto.IRange;
    }
}

/// <reference types="manifesto.js" />
declare namespace Manifold {
    class MultiSelectState {
        isEnabled: boolean;
        ranges: IRange[];
        canvases: ICanvas[];
        allCanvasesSelected(): boolean;
        allRangesSelected(): boolean;
        allSelected(): boolean;
        getAll(): IMultiSelectable[];
        getAllSelectedCanvases(): ICanvas[];
        getAllSelectedRanges(): IRange[];
        getCanvasById(id: string): ICanvas;
        getCanvasesByIds(ids: string[]): ICanvas[];
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        selectAll(selected: boolean): void;
        selectCanvas(canvas: ICanvas, selected: boolean): void;
        selectAllCanvases(selected: boolean): void;
        selectCanvases(canvases: ICanvas[], selected: boolean): void;
        selectRange(range: IRange, selected: boolean): void;
        selectAllRanges(selected: boolean): void;
        selectRanges(ranges: IRange[], selected: boolean): void;
        setEnabled(enabled: boolean): void;
    }
}

declare namespace Manifold {
    class Translation {
        value: string;
        locale: string;
        constructor(value: string, locale: string);
    }
}

declare namespace Manifold {
    class UriLabeller {
        labels: any;
        constructor(labels: Object);
        format(url: string): string;
    }
}

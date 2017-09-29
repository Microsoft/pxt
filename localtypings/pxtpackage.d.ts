declare namespace pxt {
    interface Map<T> {
        [index: string]: T;
    }

    interface TargetVersions {
        target: string;
        pxt: string;
        pxtCrowdinBranch?: string;
        tag?: string;
        branch?: string;
        commits?: string; // URL
    }

    /**
     * The schema for the pxt.json package files
     */
    interface PackageConfig {
        name: string;
        version?: string;
        installedVersion?: string;
        // url to icon -- support for built-in packages only
        icon?: string;
        // semver description for support target version
        documentation?: string; // doc page to open when loading project
        targetVersions?: TargetVersions; // versions of the target/pxt the package was compiled against
        description?: string;
        dependencies: Map<string>;
        license?: string;
        authors?: string[];
        files: string[];
        simFiles?: string[];
        testFiles?: string[];
        public?: boolean;
        binaryonly?: boolean;
        platformio?: PlatformIOConfig;
        yotta?: YottaConfig;
        npmDependencies?: Map<string>;
        card?: CodeCard;
        additionalFilePath?: string;
        gistId?: string;
        extension?: PackageExtension; // describe the associated extension if any
    }

    interface PackageExtension {
        namespace?: string; // Namespace to add the button under, defaults to package name
        label?: string; // Label for the flyout button, defaults to `Editor`
        color?: string; // for new category, category color
        advanced?: boolean; // for new category, is category advanced
    }

    interface PlatformIOConfig {
        dependencies?: Map<string>;
    }

    interface CompilationConfig {
        description: string;
        config: any;
    }

    interface YottaConfig {
        dependencies?: Map<string>;
        config?: any;
        /**
         * Overridable config flags
         */
        optionalConfig?: any;
        userConfigs?: CompilationConfig[];
        /* deprecated */
        configIsJustDefaults?: boolean;
        /* deprecated */
        ignoreConflicts?: boolean;
    }

    interface CodeCard {
        name?: string;
        shortName?: string;
        title?: string;
        role?: string;
        ariaLabel?: string;
        label?: string;
        tabIndex?: number

        color?: string; // one of semantic ui colors
        description?: string;
        blocksXml?: string;
        typeScript?: string;
        imageUrl?: string;
        youTubeId?: string;
        time?: number;
        url?: string;
        responsive?: boolean;
        cardType?: "file" | "example" | "codeExample" | "tutorial" | "project";

        header?: string;
        any?: number;
        hardware?: number;
        software?: number;
        blocks?: number;
        javascript?: number;

        icon?: string;
        iconContent?: string; // Text instead of icon name
        iconColor?: string;

        onClick?: (e: any) => void; // React event

        target?: string;
        className?: string;
    }
}
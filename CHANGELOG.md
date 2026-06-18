# [1.3.0](https://github.com/johnsyweb/ambassy/compare/v1.2.1...v1.3.0) (2026-06-18)


### Bug Fixes

* **build:** load window type augmentations from src for webpack ([16d5ed9](https://github.com/johnsyweb/ambassy/commit/16d5ed9040ce5d824ee7a40d1bbff0cff2fc229c))
* **map:** let pointer events pass through selection highlight ring ([e43268c](https://github.com/johnsyweb/ambassy/commit/e43268cc27815ad9d4785fdc1b078aa917a7911c))
* **map:** show tooltips above territory map search panel ([3fbfa1f](https://github.com/johnsyweb/ambassy/commit/3fbfa1f2c12520f89308dbc04d218157527b0dc1))


### Features

* **map:** add helpers for screenshot automation ([0352ee4](https://github.com/johnsyweb/ambassy/commit/0352ee480d3dd092b0ed1f0617b3543c9b095f8c))
* **screenshots:** drive territory map search scene for marketing images ([16bb45a](https://github.com/johnsyweb/ambassy/commit/16bb45aad696189870812d595f113d29b5f26d06))

## [1.2.1](https://github.com/johnsyweb/ambassy/compare/v1.2.0...v1.2.1) (2026-06-17)


### Bug Fixes

* **ui:** show keyboard shortcuts dialog on empty-state screen ([f41c95d](https://github.com/johnsyweb/ambassy/commit/f41c95d4c9ca4e115fd19eec58a98bef59c4d335)), closes [#ambassy](https://github.com/johnsyweb/ambassy/issues/ambassy)

# [1.2.0](https://github.com/johnsyweb/ambassy/compare/v1.1.0...v1.2.0) (2026-06-17)


### Bug Fixes

* **map:** add outline to prospect diamond markers for visibility ([5749451](https://github.com/johnsyweb/ambassy/commit/5749451e9388aa29823cd66bbf6fdc9ad666259f))
* **map:** keep viewport when selecting from territory map search ([58f7b55](https://github.com/johnsyweb/ambassy/commit/58f7b559a5b7bf5fd1061366ce6e64387c5b089a))


### Features

* **event-teams:** enable reallocate button without row selection ([3a8712d](https://github.com/johnsyweb/ambassy/commit/3a8712d49c4b84fde1b49c7f0150c4be835e0b3f))
* **map:** add prospect map marker readiness utilities ([5a06973](https://github.com/johnsyweb/ambassy/commit/5a069738e9defe3096ee46ce911b1d654ebda0fa))
* **map:** add prospective event from place pin ([08c330d](https://github.com/johnsyweb/ambassy/commit/08c330d8ff2d66510d15d121f8462a20dd510a31))
* **map:** add territory map marker zoom scale utility ([48c2056](https://github.com/johnsyweb/ambassy/commit/48c2056974901fa35da87b29cdd0c5130d33fa4d))
* **map:** add territory map search for events, prospects, and places ([cf7abc9](https://github.com/johnsyweb/ambassy/commit/cf7abc90ebb36e90f07a7fe70aa74bcc9ed5769a))
* **map:** add visual prospect map legend with dismiss and restore ([445afab](https://github.com/johnsyweb/ambassy/commit/445afab44d635e4f4f1071a0cda26acd92d3aee0))
* **map:** allow minimising territory map search panel ([e10a785](https://github.com/johnsyweb/ambassy/commit/e10a7857749cf3a27e8c8a006840c71fc5bf552c))
* **map:** persist territory map overlay visibility in session ([d766d65](https://github.com/johnsyweb/ambassy/commit/d766d6524a94482490ef03abaca27a05aeb589da))
* **map:** refresh selection highlights when map zoom changes ([2b797fd](https://github.com/johnsyweb/ambassy/commit/2b797fdfba9f656739fc51a27895ddd5a6f74e00))
* **map:** render prospect launch readiness on territory map ([3658b0a](https://github.com/johnsyweb/ambassy/commit/3658b0aace827fb7742da81f9886b06ada88b756))
* **map:** scale territory map markers with zoom ([61471ae](https://github.com/johnsyweb/ambassy/commit/61471ae8ae2bd56ab3265121d7487e1489596aa7))
* **map:** split territory map into separate marker overlays ([fd80dfb](https://github.com/johnsyweb/ambassy/commit/fd80dfb5bbc2b06b3ee532772782dfd744589ac3))
* **prospects:** improve Add Prospect address geocoding and feedback ([4ff324f](https://github.com/johnsyweb/ambassy/commit/4ff324f6e204fffacbbd5b4c08084c46ca04de67))
* **prospects:** toggle launch readiness status from prospects table ([50bdf1f](https://github.com/johnsyweb/ambassy/commit/50bdf1f33289a8553407ccd33b47ea07d92782d0))
* **prospects:** use plain-language status labels in table ([b15a3e4](https://github.com/johnsyweb/ambassy/commit/b15a3e464e4583ad027ffb20a70ace91cc21f4ed))
* **ui:** restructure empty-state introduction with CTA above fold ([6969a36](https://github.com/johnsyweb/ambassy/commit/6969a365e4d32335b815da25ab156a12ed954832))

# [1.1.0](https://github.com/johnsyweb/ambassy/compare/v1.0.0...v1.1.0) (2026-06-17)


### Bug Fixes

* **ci:** avoid network hangs in map-dom-budget smoke test ([3447b08](https://github.com/johnsyweb/ambassy/commit/3447b085c947246b40de710b9f0f7bce9a08f604))
* **ci:** cap map-dom-budget job at five minutes ([819f1a1](https://github.com/johnsyweb/ambassy/commit/819f1a1ce4f7e9f662ff5f63a736c8ed9c591418))
* **ci:** exit cleanly after map-dom-budget smoke test ([66797ce](https://github.com/johnsyweb/ambassy/commit/66797ce3cc812c5e216a9de96decbe021600f8fe))
* **ci:** install Chrome before map-dom-budget smoke test ([e64dc54](https://github.com/johnsyweb/ambassy/commit/e64dc54cf8d3f6f28ec761d2dfae2122138571c3))


### Features

* **ci:** add manual release and deploy workflow dispatch ([23008a3](https://github.com/johnsyweb/ambassy/commit/23008a36c1848aeed7071a03b05aca3973358994))

# 1.0.0 (2026-06-17)


### Bug Fixes

* **007:** include prospect allocations and distances in reallocation dialog ([af385c2](https://github.com/johnsyweb/ambassy/commit/af385c29e6e3c646dc99f3dc81a76a07371f202f))
* **007:** use distance to nearest live event as tiebreaker for prospect reallocation ([fd1b50f](https://github.com/johnsyweb/ambassy/commit/fd1b50fad65e8cd67d590ba004fcdbfe0398272a))
* **a11y:** improve footer link contrast and hover legibility ([e1088e2](https://github.com/johnsyweb/ambassy/commit/e1088e22026b50e77e56db2ca9f3aef041755882))
* add eslint-disable for tracking variables in populateMap ([bae9054](https://github.com/johnsyweb/ambassy/commit/bae9054890fb3527c5d048386f18720d68ff86a4))
* add EventDetails import to index.ts ([9faa8e5](https://github.com/johnsyweb/ambassy/commit/9faa8e53da354b5479ac28474108a28a7956e8b0))
* add issuesState declaration ([b4ad4d8](https://github.com/johnsyweb/ambassy/commit/b4ad4d847a8f8ec3475cd9645c48dcfdc140d687))
* add missing .tool-versions file for CI ([e8eccfe](https://github.com/johnsyweb/ambassy/commit/e8eccfea0e0c83ee6726d09465a4f4469a2681fc))
* add missing imports and issuesState declaration ([b13a880](https://github.com/johnsyweb/ambassy/commit/b13a880f4548ccff7cea50ada4c7bf370b8e72fd))
* add missing log parameter in test and null check ([865082c](https://github.com/johnsyweb/ambassy/commit/865082c0ae56410f1a5191d71f527bd1914b810b))
* add missing persistence calls for geocoded address resolution ([2b8fc99](https://github.com/johnsyweb/ambassy/commit/2b8fc99edd14f563f4c5bef6a1e8db81c9eeb340))
* add missing Voronoi points building code ([38d9835](https://github.com/johnsyweb/ambassy/commit/38d98359a8b050cf577b573a7e30e10498ec708f))
* add null check for eventDetails before use ([e6e51bb](https://github.com/johnsyweb/ambassy/commit/e6e51bbfc8816ecb93c1f8db3427276e8016a05f))
* add persistEventDetails function and use it in resolution ([42c40c3](https://github.com/johnsyweb/ambassy/commit/42c40c33f0eed98e6921ffa5ceb56d89bb75f97a))
* add persistEventDetails to import using sed ([075e5da](https://github.com/johnsyweb/ambassy/commit/075e5da6dd2ed7328eb0079efb304792bb1267c7))
* add State column header to Event Ambassadors table ([4b2c1ae](https://github.com/johnsyweb/ambassy/commit/4b2c1ae16791fae5505fdcb8498e480061ea5f88))
* add trackStateChange to resolveIssueWithEvent ([6b28f4d](https://github.com/johnsyweb/ambassy/commit/6b28f4d3d403c464b410f0cedbb9c6b3ff4599f3))
* add tsconfig-paths to devDependencies ([cce2a02](https://github.com/johnsyweb/ambassy/commit/cce2a0233e50f6738e543b06e478d8f6f5b5d477))
* allow export when changesLog is missing ([54d751e](https://github.com/johnsyweb/ambassy/commit/54d751eaa6b29535c1428a28f4fd0e6d421581bf))
* change score from const to let to allow modification for prioritization ([547555a](https://github.com/johnsyweb/ambassy/commit/547555a87a12e8ddf631025b8137c6106b18c32f))
* **ci:** pin download-artifact to a valid v7 SHA ([31186e9](https://github.com/johnsyweb/ambassy/commit/31186e97a973ec0fa005d75158a9559253c92ef5))
* **ci:** Use latest pnpm action ([8517e24](https://github.com/johnsyweb/ambassy/commit/8517e243cddfdf087ba14a0b34dfa42125425af1))
* clarify large-state sharing behaviour and remove confusing data URL instructions ([aed1a39](https://github.com/johnsyweb/ambassy/commit/aed1a39e7e6cad7fa38b979239da88de7c0e97f8))
* complete Share/Open/Save terminology updates ([b27000b](https://github.com/johnsyweb/ambassy/commit/b27000bd266a37e80bd4218b6f3a1c56ffd610dc))
* configure ts-node to resolve TypeScript path aliases ([716c4a2](https://github.com/johnsyweb/ambassy/commit/716c4a2a05603c1d1a75ff82070faf37d4e0bbe2))
* correct BeforeUnloadEvent test mocks in both test cases ([0448a43](https://github.com/johnsyweb/ambassy/commit/0448a4366e7d268c7168e2920cdea71765569264))
* correct countries object mapping for country code lookups ([d2df370](https://github.com/johnsyweb/ambassy/commit/d2df370c897db3354e2a32af7f501f983b6150bf))
* correct d3-geo-voronoi import syntax ([f7b5904](https://github.com/johnsyweb/ambassy/commit/f7b590434913601b683c2e2ecede0fcb3f6c7dea))
* correct d3-geo-voronoi import to use named export ([7574996](https://github.com/johnsyweb/ambassy/commit/7574996e66317fdb8c2aceef129a907abf191540))
* correct d3-geo-voronoi type declaration syntax ([bd07b6e](https://github.com/johnsyweb/ambassy/commit/bd07b6e6cd7ba9c8c11af07a657ddf0ed0bc65b9))
* correct imports and issuesState declaration ([065a592](https://github.com/johnsyweb/ambassy/commit/065a5921aba487a704df58be3225ef6ccd570188))
* correct prospective events CSV format and data model ([bc44273](https://github.com/johnsyweb/ambassy/commit/bc44273967805cde729d550138406d78e89e32b3))
* correct Regional Event Ambassador polygon visualization ([171384e](https://github.com/johnsyweb/ambassy/commit/171384efb23bd71e58a7d7094dc97494d14eee5b))
* disable webpack cache to resolve module resolution issues ([e6b40ec](https://github.com/johnsyweb/ambassy/commit/e6b40ec90e67e5e7df229cc01aba9758142d67f8))
* display correct REA names in reallocation dialogs ([fbb3b8f](https://github.com/johnsyweb/ambassy/commit/fbb3b8ff51e9a63f2295fd3745e1a326944c6e1f))
* display neighboring events with distances correctly ([cb6815a](https://github.com/johnsyweb/ambassy/commit/cb6815ae68a46811e451cb11206afd10ca04d526))
* ensure geocoded events persist across page refreshes ([513865d](https://github.com/johnsyweb/ambassy/commit/513865d59430aacf35bd73c1ff576e5cb1caaf35))
* ensure map reallocation uses fresh data from session storage ([3e413a3](https://github.com/johnsyweb/ambassy/commit/3e413a31c0e4f6e85fb939b23771c4c5fcd99bd3))
* ensure reallocation from map only triggers when eventTeamsTableData is defined ([c95d8f0](https://github.com/johnsyweb/ambassy/commit/c95d8f0b3e1b15b96a7369864a760ed03bf36754))
* ensure trackStateChange always marks changes as unsaved ([69fee3d](https://github.com/johnsyweb/ambassy/commit/69fee3d61b7da6a6f97bbf07b1dee0bd0f5e98ea))
* ensure trackStateChange called after all persistence in offboard functions ([a7e28b3](https://github.com/johnsyweb/ambassy/commit/a7e28b3c3075ee206400d98f03b966b7d84e1162))
* ensure trackStateChange called after prospect reallocation ([67ea552](https://github.com/johnsyweb/ambassy/commit/67ea552e861b623fa9b17948ebe47830d185f2e3))
* filename ([b9cc0d0](https://github.com/johnsyweb/ambassy/commit/b9cc0d02a0470fe63d9832e338ed0f4b7833d55a))
* filter out-of-bounds events from Voronoi polygon calculation ([5f46932](https://github.com/johnsyweb/ambassy/commit/5f4693217c3544c6feec2bf5705c837a29bc5666))
* handle ChangeTracker initialization for page refreshes ([39fb84f](https://github.com/johnsyweb/ambassy/commit/39fb84f7b7e6457075d33a4587494aaf7f191f02))
* handle empty states in table sorting initialization ([9ff8f87](https://github.com/johnsyweb/ambassy/commit/9ff8f873302acc87e99bd5c20421ec1d42766cb7))
* handle URLs too long for server limits (431 error) ([dc8687c](https://github.com/johnsyweb/ambassy/commit/dc8687cb5d87624942f6c65554e89cd5ed0204a3))
* improve accessibility of unallocated event markers ([64c2176](https://github.com/johnsyweb/ambassy/commit/64c2176a14edbd369279fd98e2bb934cfeafafe6))
* improve coordinate conflict resolution for polygon rendering ([dafa3c1](https://github.com/johnsyweb/ambassy/commit/dafa3c1149f7d571dcb8b79783f75dbbf7e5544a))
* improve d3-geo-voronoi type definition to catch incorrect imports ([32b05a8](https://github.com/johnsyweb/ambassy/commit/32b05a8970b620e70dd0d3225d3036a16a825ae2))
* improve geocoding error handling and update example address ([9c92b74](https://github.com/johnsyweb/ambassy/commit/9c92b74da869871f8b3390ceb27609ca1bb46782))
* improve keyboard navigation in sharing dialog ([7968dd4](https://github.com/johnsyweb/ambassy/commit/7968dd4e2c269875b88ee4aae5fd2056281be198))
* improve reallocation condition to explicitly check event exists in table data ([e8b2573](https://github.com/johnsyweb/ambassy/commit/e8b2573a32a1c149d0fcf7abe09f4f663460881f))
* improve screenshot script data loading and rendering ([323d393](https://github.com/johnsyweb/ambassy/commit/323d393c9545d9786cb1ab18ff3c632177284aa7))
* improve unsaved changes detection for export reminder ([6b7294c](https://github.com/johnsyweb/ambassy/commit/6b7294c3c017b25ef4c15df7f634fc994a9d63fc))
* initialize ChangeTracker when data loads from localStorage ([73dfeac](https://github.com/johnsyweb/ambassy/commit/73dfeaccf3eea9efa2043a092cbd7bdd4df3c475))
* initialize table-map navigation handlers before populating tables ([350fad1](https://github.com/johnsyweb/ambassy/commit/350fad181694c0784511a71d1cacda2fc499ff28))
* make Voronoi polygons non-interactive to prevent blocking marker clicks ([6991298](https://github.com/johnsyweb/ambassy/commit/69912989cc2bbd52054297facd1e2950b219740c))
* move dialogs outside #ambassy div to ensure accessibility ([648165b](https://github.com/johnsyweb/ambassy/commit/648165b43a69fdf10af5661d45d96e57c35d5924)), closes [#ambassy](https://github.com/johnsyweb/ambassy/issues/ambassy) [#ambassy](https://github.com/johnsyweb/ambassy/issues/ambassy)
* new style ([7f62bda](https://github.com/johnsyweb/ambassy/commit/7f62bdab4eae8c3833a29ec8d2d3ed0a17881f6b))
* normalise eventname to slug when building history URLs ([912bc85](https://github.com/johnsyweb/ambassy/commit/912bc856759ae6ee1815c624ecb3aeb16978474c))
* only include events with ambassador data in Voronoi polygons ([2f2f20e](https://github.com/johnsyweb/ambassy/commit/2f2f20e624bc8f9adc94108ce4aaf524096d6d48))
* pass eventAmbassadors and regionalAmbassadors to createEventShortNameDropdown ([9f95281](https://github.com/johnsyweb/ambassy/commit/9f95281e2699987d3480202a8075ba2d98452751))
* populate REA column from reverse relationship and update EA field ([990b04b](https://github.com/johnsyweb/ambassy/commit/990b04b51583956715947e88ac518e1850fbd170))
* **populateMap:** use normalised lookups for map rendering ([0c531a3](https://github.com/johnsyweb/ambassy/commit/0c531a3da75090ad51aa8d89610e96a86f950850))
* preserve Tampermonkey metadata in dist finish export userscript ([6c30493](https://github.com/johnsyweb/ambassy/commit/6c30493e7660abd30c000044f5e15e06007aac92))
* prevent bisected polygons with deterministic coordinate offsetting ([3a7be70](https://github.com/johnsyweb/ambassy/commit/3a7be70a916d4fb178dc2500cd968d9630e0fe11))
* prevent dialog ID mutation in showSharingDialog ([9dfad11](https://github.com/johnsyweb/ambassy/commit/9dfad1181e01230f0d2c345e6f214d681cf617dc))
* prevent duplicate prospects from being imported ([de5e904](https://github.com/johnsyweb/ambassy/commit/de5e904a34df550721f703facd932f8e48319433))
* prevent map layers control duplication and storage event refresh loop ([8d2d21b](https://github.com/johnsyweb/ambassy/commit/8d2d21b4075141e8f4aa4274cc0877680fb44d73))
* prevent polygon splitting in Regional Event Ambassador layer ([4c67612](https://github.com/johnsyweb/ambassy/commit/4c67612c8f604bbe6b81a9e1096ed1e5ee69e2f9))
* prioritize exact and normalized matches over fuzzy matching ([596e3c0](https://github.com/johnsyweb/ambassy/commit/596e3c0788facdc5b41a680a4781f670c18b9742))
* properly mock textarea element in clipboard test ([7693483](https://github.com/johnsyweb/ambassy/commit/7693483383603aa61108793ef645561157b5023e))
* prospective events geocoding to use event names instead of just state/country ([0b238c6](https://github.com/johnsyweb/ambassy/commit/0b238c6a8624b2e97f99c5a2f2ca3ef75fdd7832))
* prospects table now persists across page reloads ([64ba5fc](https://github.com/johnsyweb/ambassy/commit/64ba5fcb3437765edcd52b66a70a11684d056f9a))
* recalculate eventTeamsTableData after EA reallocation ([4cf2410](https://github.com/johnsyweb/ambassy/commit/4cf24107a938afe38650398aa7a3b73c6a50bb52))
* reload log from storage in ambassy() for consistency ([33e948f](https://github.com/johnsyweb/ambassy/commit/33e948f1b97df305730e05a787dbe1d54b3d029f))
* remove duplicate coordinates before Voronoi generation ([bec870a](https://github.com/johnsyweb/ambassy/commit/bec870a3b58b9e634b821ee4aca1f6920ff350ef))
* remove duplicate import of suggestEventAmbassadorReallocation ([cdb5162](https://github.com/johnsyweb/ambassy/commit/cdb51626a5c28b15d0280673346712408cea73be))
* remove duplicate imports in index.ts ([9036f2c](https://github.com/johnsyweb/ambassy/commit/9036f2ceffe620cd757e955b09cc9b63eeac58c1))
* remove incorrect event check in deploy workflow condition ([39e8982](https://github.com/johnsyweb/ambassy/commit/39e8982f63b008771029a9d0ffcadff73837ad6b))
* remove manual tsconfig-paths import (handled by ts-node flag) ([7e68c62](https://github.com/johnsyweb/ambassy/commit/7e68c629b9b8f2808f411b84f57f8769fdd1d859))
* remove reference to deleted eventTeamsTableContainer ([f2d140d](https://github.com/johnsyweb/ambassy/commit/f2d140d94da43dce7a25728011cbc9bc16460f71))
* remove unused CapacityLimits import from suggestEventAllocation ([efec6a1](https://github.com/johnsyweb/ambassy/commit/efec6a1f32a03cacee26ce7c1dd8010ac96ff9ed))
* remove unused eventsWithoutData variable ([526fe27](https://github.com/johnsyweb/ambassy/commit/526fe27b08c8555f19cfb92ebbeb700b020b046d))
* remove unused imports and prefix unused parameters ([a0f8b04](https://github.com/johnsyweb/ambassy/commit/a0f8b04a8006c25e290c603bef77a483ae004486))
* remove unused imports and variables ([e36cfad](https://github.com/johnsyweb/ambassy/commit/e36cfad3e0b5958a3c9549d4e6b6934d1d859536))
* remove unused RegionalAmbassadorMap import from test file ([8bf2fdf](https://github.com/johnsyweb/ambassy/commit/8bf2fdf86a1ffdfb0daef83dfa54554cb0275072))
* remove unused variable in showReallocationDialog test ([f149055](https://github.com/johnsyweb/ambassy/commit/f149055c97cea2b1175cbafd7b5297e732d36b21))
* replace relative imports with alias imports in actions directory ([536277f](https://github.com/johnsyweb/ambassy/commit/536277f17f9202066dfaf61e332623d28d0e8aff))
* resolve all linting errors ([97da13e](https://github.com/johnsyweb/ambassy/commit/97da13eaa2223d538212e2c770eed44de073c058))
* resolve all linting issues for Event Issues Resolution feature ([9df9b8a](https://github.com/johnsyweb/ambassy/commit/9df9b8aa358e01587ba999bb996fcbd9a1ee386e))
* resolve all remaining test failures ([dcffe1d](https://github.com/johnsyweb/ambassy/commit/dcffe1db18472c34bbe17b279a770a8c02854496))
* resolve all test failures for reliability ([c82ca38](https://github.com/johnsyweb/ambassy/commit/c82ca3845f0651676972b368f2b43044cc51a33d))
* resolve allocations when CSV apostrophe differs from events.json ([2826efa](https://github.com/johnsyweb/ambassy/commit/2826efad5d6193d0b60be9a5d0c20b325a98e167))
* resolve compilation errors in prospect reallocation ([7b79510](https://github.com/johnsyweb/ambassy/commit/7b79510679ca6424c4924e680fd818d8e237b757))
* resolve date deserialization issue for prospective events ([c9b4140](https://github.com/johnsyweb/ambassy/commit/c9b4140e38d2d631303763a10e4c0842c173f293))
* resolve eslint errors in coordinate and prospects tests ([dc3a588](https://github.com/johnsyweb/ambassy/commit/dc3a588c10e5d6f4c8e3866066b98fac3ba33760))
* resolve ESLint preserve-caught-error and no-useless-assignment ([69ebe6f](https://github.com/johnsyweb/ambassy/commit/69ebe6f6984f65d8434006a49dcc11d2454c1da6))
* resolve linting errors in storage.test.ts and tabs.ts ([036a0b9](https://github.com/johnsyweb/ambassy/commit/036a0b908ffc97a830148b51b547a7b273297ad6))
* resolve merge conflicts and fix TypeScript errors ([2f5057a](https://github.com/johnsyweb/ambassy/commit/2f5057abe77b0fd504c1191a4bd2d248291f5056))
* resolve naming conflict with showReallocationDialog ([dfcb57b](https://github.com/johnsyweb/ambassy/commit/dfcb57b0e27cc413f129eb26238fae9ae1865d68))
* resolve TypeScript compilation errors ([8270348](https://github.com/johnsyweb/ambassy/commit/82703480bee2423ff96d7bea864dddac6d7d1579))
* resolve TypeScript narrowing issue in searchEvents ([42ed17a](https://github.com/johnsyweb/ambassy/commit/42ed17ab7c817a08cc56eaf2ea07bd03f9b8019f))
* restore constraining points for proper Voronoi polygon boundaries ([78794fd](https://github.com/johnsyweb/ambassy/commit/78794fd56818cecc0c272b5c914b402180de633f))
* restore EventAmbassador and RegionalAmbassador imports ([fd26ace](https://github.com/johnsyweb/ambassy/commit/fd26ace460b2d2483061647ce8e6cc3405d01765))
* restore eventsWithData variable used in populateMap ([49c0103](https://github.com/johnsyweb/ambassy/commit/49c010311b97a73d9fb19565e6012f43f43298dc))
* restore missing imports that are actually used ([75af90c](https://github.com/johnsyweb/ambassy/commit/75af90c5579fb8a48f31d19401a957695d73d1d1))
* restore needed imports in test files ([7b7138e](https://github.com/johnsyweb/ambassy/commit/7b7138e2e581f11c1fbeda06a248ab1bc90a2238))
* restore processedEvents variable used in populateMap ([6752605](https://github.com/johnsyweb/ambassy/commit/67526055a461036ab7549678be070ed2699c2935))
* restore refreshUI import for event short name dropdown ([a440864](https://github.com/johnsyweb/ambassy/commit/a4408641ba72b795df2087f2c70e27933527a582))
* retrieve map objects dynamically in navigation handlers ([95c871d](https://github.com/johnsyweb/ambassy/commit/95c871d90ce010de606f8d6771f03bbb66eb3b04))
* rewrite searchEvents to fix exact match prioritization ([9dad9b7](https://github.com/johnsyweb/ambassy/commit/9dad9b71a219d0820a71f5449182d0afc9e9ecee))
* save all name variations when resolving issues and add event history links ([43392e3](https://github.com/johnsyweb/ambassy/commit/43392e3f8a5f84287958881219248c61d210507d))
* simplify coordinate offset to prevent polygon splitting ([5869819](https://github.com/johnsyweb/ambassy/commit/58698197ef21ef51cba3b66a81866af100035a35))
* stash changes before pull rebase in screenshots workflow ([9420d13](https://github.com/johnsyweb/ambassy/commit/9420d13331bd975d4f63bb4ad02643a91af938ae))
* **test:** restore Jest TypeScript globals after deps upgrade ([f6584c3](https://github.com/johnsyweb/ambassy/commit/f6584c3a7f832d64b92a20ab156389b84e712bf6))
* unstage changes before git pull rebase in screenshots workflow ([f9e1cd6](https://github.com/johnsyweb/ambassy/commit/f9e1cd67423415756be62172d0a256800c71a324))
* update file input title to match new terminology ([8a7390c](https://github.com/johnsyweb/ambassy/commit/8a7390cea0125c62a4d9db8976badd13dc5a0f70))
* update imports in tableMapNavigation to use alias paths ([e0732ea](https://github.com/johnsyweb/ambassy/commit/e0732eaa879046ac0f2bd57d397621f53122f983))
* update reallocate button states when selection changes ([6ee3542](https://github.com/johnsyweb/ambassy/commit/6ee35428dd9f06faf14546840b44ce65fe1b0ce6))
* update tests to find correct row instead of assuming first row ([52752aa](https://github.com/johnsyweb/ambassy/commit/52752aad45e96ef243cbc90348f864d3c884f882))
* update tests to fix failures ([9b3743e](https://github.com/johnsyweb/ambassy/commit/9b3743e1df2f7257465da90ce370603b92179660))
* update tests to match current implementation ([675e7ec](https://github.com/johnsyweb/ambassy/commit/675e7ec85557433f7f05d034cb83990aec45e653))
* update URL sharing dialog to use app URL format and add native share success message ([016277a](https://github.com/johnsyweb/ambassy/commit/016277aa9493b7bc1e8617d7a233bff475262b02))
* use actual handler functions in refreshIssuesTable ([2f1282f](https://github.com/johnsyweb/ambassy/commit/2f1282fb50fd9b4a08c7bb3b68ed2921e2dbb9b9))
* use consistent coordinate formatting in issue resolution logs ([26354f1](https://github.com/johnsyweb/ambassy/commit/26354f171ab2e8daeca4f1b30c0bf0585f5d8a8c))
* use dynamic port and auto-install puppeteer browsers ([6b019bf](https://github.com/johnsyweb/ambassy/commit/6b019bfe729e2aae53e9d6c3e982b5ddec486efe))
* use eventAmbassadors and regionalAmbassadors parameters ([f71a78e](https://github.com/johnsyweb/ambassy/commit/f71a78edde27c7fc947e441f0ac3eadf9e741cd0))
* use eventname property instead of EventShortName for URLs ([a7496bf](https://github.com/johnsyweb/ambassy/commit/a7496bfd01b105c3ba5b73917300b8c2d49997bd))
* use official GitHub Actions v4 for Pages deployment ([2944ff5](https://github.com/johnsyweb/ambassy/commit/2944ff58b432f2a488a3eb586b4504a7c9c0b2f5)), closes [peaceiris/actions-#pages](https://github.com/peaceiris/actions-/issues/pages)
* use onclick/onkeydown for reallocate button event handlers ([c39d88f](https://github.com/johnsyweb/ambassy/commit/c39d88fcf426c32248bd52a63ee5da1d56b6e94e))
* use same color assignment logic as map for ambassador tables ([55f8d4c](https://github.com/johnsyweb/ambassy/commit/55f8d4c38404684e9f1eaf54103b6f02dfb55ff8))
* use static imports for search dialog functions ([155e73f](https://github.com/johnsyweb/ambassy/commit/155e73f18098d74b2f8ca2f55ef1311f1361b4bb))
* use TLD-based country codes with UK->GB ISO mapping ([6c5998d](https://github.com/johnsyweb/ambassy/commit/6c5998d5da77305e9a493c5e4cc806e78c3ee0d9))
* **userscript:** use www.johnsy.com for Ambassy URLs ([8fb0945](https://github.com/johnsyweb/ambassy/commit/8fb09450d834699d6139a504e61dd0e8d3212796))
* **utils:** normalise apostrophes in event name matching ([cc5bace](https://github.com/johnsyweb/ambassy/commit/cc5baceb8e79e2be63e15837fdc4e65bfef8f8db))
* **visit-history:** only show pending import banner when data is loaded ([5ad1f4e](https://github.com/johnsyweb/ambassy/commit/5ad1f4e0e1e10df7b171c26de9ece2eff850d885))
* **voronoi:** extract local rings with PIP validation and raw cell fallback ([2d07f8c](https://github.com/johnsyweb/ambassy/commit/2d07f8c4a5688f8edb77aed7e5526da5a12b54a8))
* wire up offboard button handlers ([8be1509](https://github.com/johnsyweb/ambassy/commit/8be1509ed6626be97a97966faace3ebd04f1e415))


### Documentation

* **constitution:** prevent lint error accumulation ([5c687eb](https://github.com/johnsyweb/ambassy/commit/5c687ebe457f68e9dee196f13002d3ffce5b5363))
* **constitution:** prohibit commented-out code ([e96b367](https://github.com/johnsyweb/ambassy/commit/e96b367c517c1eaa99bd4d8f84ec70f7df6628d5))


### Features

* **003:** add short form format to Other dropdown in reallocation dialog ([47d1116](https://github.com/johnsyweb/ambassy/commit/47d1116f214c2b95b554e12960d5adf2bebdd964))
* **003:** enhance reallocation dialog with detailed context ([3144734](https://github.com/johnsyweb/ambassy/commit/31447344199cbdafe06182c98b4b79d83b4d0b3c))
* **005:** add icon to Geocode Address button ([745018b](https://github.com/johnsyweb/ambassy/commit/745018b8fa1f8b4ab9cb1dfd4293d05a06b895bb))
* **006:** add switch to address entry in search dialog ([f55c407](https://github.com/johnsyweb/ambassy/commit/f55c407f174f23ade5b32d99091377856ee3be25))
* **007:** implement prospect removal functionality ([402a720](https://github.com/johnsyweb/ambassy/commit/402a720bb61cc6260252c0b69477f1ed4c9f8c9b))
* add ambassador finish history models ([3079f2c](https://github.com/johnsyweb/ambassy/commit/3079f2c67c3cc2ae943ff75dd85c430978ab42b1))
* add ambassador name filter matching utilities ([87aa6d6](https://github.com/johnsyweb/ambassy/commit/87aa6d69ac6416bdb4025d4064b2d6edbbd98554))
* add ambassador name filter UI and keyboard shortcuts ([aa5fef3](https://github.com/johnsyweb/ambassy/commit/aa5fef31d98602285521cf3a8e2eae24a7f3d4ce))
* add Ambassadors table to display all ambassadors ([7ade6e7](https://github.com/johnsyweb/ambassy/commit/7ade6e7a9b5dd645d2702a4f4510fbf15b97dd55))
* add color indicators to Event Teams table ([bbf5f5e](https://github.com/johnsyweb/ambassy/commit/bbf5f5eb7450acdd85ab1559822290fd3050ab8d))
* add drag-and-drop import and consolidate import handling ([5fdae28](https://github.com/johnsyweb/ambassy/commit/5fdae28e4f52e0434c18214dc7e12e83c1533388))
* add EA-to-REA reallocation feature ([7a35fdc](https://github.com/johnsyweb/ambassy/commit/7a35fdc4e5c675b21887afeed96c802c157338c3))
* add event history links to Event Ambassador tab ([24180ac](https://github.com/johnsyweb/ambassy/commit/24180ac2e639dc6c08dfb313f1f8c3e9eb1fb0c4))
* add export reminder before window close ([d5c0b84](https://github.com/johnsyweb/ambassy/commit/d5c0b84b0ccb45d0913ea5dad65726291aff268a))
* add export/import buttons to map view ([d75f0c4](https://github.com/johnsyweb/ambassy/commit/d75f0c4cc06aa4d3213e6ef69001baf2033f0003))
* add finish export userscript and install tooling ([cbdad3a](https://github.com/johnsyweb/ambassy/commit/cbdad3a8a1d9f11880ec723931eb6fab2fd85fda))
* add finish history page and import handoff ([e1c1301](https://github.com/johnsyweb/ambassy/commit/e1c1301c76b77cb16c3150e202bc7184b0023c0a))
* add foundational functions for event team reallocation ([c246d36](https://github.com/johnsyweb/ambassy/commit/c246d36c8ff453abb60af77ab6ca6e1e13deebd9))
* add foundational models and functions for Event Issues Resolution ([c00fcc3](https://github.com/johnsyweb/ambassy/commit/c00fcc30c65696b5e2fe7a46085419496c0ce985))
* add foundational types and models for sharing feature ([fb96b33](https://github.com/johnsyweb/ambassy/commit/fb96b330b5f0ffc198492e83aaa2043b88426eaa))
* add header and footer with MD4 color scheme ([bb5ae0e](https://github.com/johnsyweb/ambassy/commit/bb5ae0e893e6a95c58c76d001c46293bf90333e7)), closes [#0d2b33](https://github.com/johnsyweb/ambassy/issues/0d2b33) [#30403d](https://github.com/johnsyweb/ambassy/issues/30403d)
* add header and footer with MD4 color scheme ([2eb4600](https://github.com/johnsyweb/ambassy/commit/2eb4600fd247a160a9adc2bce6fdc6fb6bb28a56)), closes [#0d2b33](https://github.com/johnsyweb/ambassy/issues/0d2b33) [#30403d](https://github.com/johnsyweb/ambassy/issues/30403d)
* add icon to upload section import button ([7c957c6](https://github.com/johnsyweb/ambassy/commit/7c957c6caf0a99e9992a49aa2a902d35d49ac331))
* add icons to action buttons in Event Teams and RA tables ([6ba7e25](https://github.com/johnsyweb/ambassy/commit/6ba7e2577869d7698613f7661215ed0b7fe91984))
* add icons to all buttons for consistent styling ([8b6fe3a](https://github.com/johnsyweb/ambassy/commit/8b6fe3a1b8df09f16cdcf64c5bf6c6a6d796ad36))
* add implementation plan for ambassador capacity management ([3bd14bc](https://github.com/johnsyweb/ambassy/commit/3bd14bca92e83e5b302ae4ad04cbe3e1271dddbf))
* add implementation plan for button accessibility improvements ([0caa1c6](https://github.com/johnsyweb/ambassy/commit/0caa1c65ce109ed9318278f8d4ac39569b4afc61))
* add implementation plan for state persistence and sharing ([ca324c5](https://github.com/johnsyweb/ambassy/commit/ca324c592c75d69c9637b4e3e459ebf6fd4449c2))
* add implementation tasks for ambassador capacity management ([cf6238a](https://github.com/johnsyweb/ambassy/commit/cf6238a63500fb98e303d2a8aa5d4689f3ac00cf))
* add implementation tasks for button accessibility improvements ([c08ba22](https://github.com/johnsyweb/ambassy/commit/c08ba22286af1407eeac7b3fd8108067e50423c3))
* add import guidance and enhance import experience ([4e12416](https://github.com/johnsyweb/ambassy/commit/4e1241676e387ba0b49d21354feb99af2109a430))
* add Issues tab and populateIssuesTable function ([b04f81f](https://github.com/johnsyweb/ambassy/commit/b04f81f85c24e0490be2b73e727785a137beaf77))
* add Issues tab refresh functions to index.ts ([7ab5faa](https://github.com/johnsyweb/ambassy/commit/7ab5faaa081b19d8a649dae408a5a2f5c257e222))
* add logging to issue resolution functions ([c25e683](https://github.com/johnsyweb/ambassy/commit/c25e683e2d4452336b90629145171f48222de89a))
* add manual deployment trigger to deploy workflow ([90864e8](https://github.com/johnsyweb/ambassy/commit/90864e8c6eae3f79f80a474d033311623a601a13))
* add map color indicators to ambassador tables ([676633c](https://github.com/johnsyweb/ambassy/commit/676633c609fe814bf46f5e61ec65db118e39c2d4))
* add map color indicators to ambassador tables ([6f0e359](https://github.com/johnsyweb/ambassy/commit/6f0e359266cec067dd521a3f73bf2fbd8b2ba72b))
* add meaningful error message for invalid Regional Ambassadors CSV ([ba77c3a](https://github.com/johnsyweb/ambassy/commit/ba77c3a61013cb82162e6d9ee0bac6064c922e6a))
* add native share API support with URL parameter loading ([b610353](https://github.com/johnsyweb/ambassy/commit/b6103535617413b0694f8cd2b0d54a52ec2a78d9))
* add parkrunner ID management and profile URL helpers ([ce0c9cd](https://github.com/johnsyweb/ambassy/commit/ce0c9cdd3dd2557052b9a2a908ddfe13483b3034))
* add parkrunner ID to ambassador models and CSV import ([ed36924](https://github.com/johnsyweb/ambassy/commit/ed369240b5b52afb03728cbd901569bd3ec055eb))
* add progress feedback for prospective events import ([421d370](https://github.com/johnsyweb/ambassy/commit/421d3707890b4c0f91c88fade4e74db4300b1716))
* add prospect by address ([f758bdb](https://github.com/johnsyweb/ambassy/commit/f758bdbb87c4bd75b6d0eb21c8933cb686b8897d))
* add prospect lifecycle controls and tests ([99a3f6f](https://github.com/johnsyweb/ambassy/commit/99a3f6f2d4c60262548124d14003049b6e2e4687))
* add prospect lifecycle controls and tests ([a0b7dbc](https://github.com/johnsyweb/ambassy/commit/a0b7dbc5e0b67ff2376ae4f4391819aa04b03caf))
* add prospect location reset functionality ([f2c675d](https://github.com/johnsyweb/ambassy/commit/f2c675d6ae81748a2311d13d9a7d8c40ccca8020))
* add prospective events to map layers ([91a64e9](https://github.com/johnsyweb/ambassy/commit/91a64e90917dae0b9b1a1edef09df04fb8f16edf))
* add REA column as first column in Event Ambassadors table ([f82f220](https://github.com/johnsyweb/ambassy/commit/f82f220966124ff0f68fa525a4a7e5b3612fd0a3))
* add Reallocate button to Event Teams table (US1) ([61dde5e](https://github.com/johnsyweb/ambassy/commit/61dde5e95bcd3c1f8985b6054fcacb65637d19fa))
* add resume banner for suppressed pending finish imports ([7b15336](https://github.com/johnsyweb/ambassy/commit/7b153366e035dd7cfe78318d2d60d662a5564783))
* add sharing dialog with multiple sharing methods ([2f98cd8](https://github.com/johnsyweb/ambassy/commit/2f98cd86332506af51c143652d620b358fd2c100))
* add specification for ambassador capacity management ([a5a5877](https://github.com/johnsyweb/ambassy/commit/a5a5877dc93de85f592d1ac3c67f5236998ad33e))
* add specification for button accessibility improvements ([9badf60](https://github.com/johnsyweb/ambassy/commit/9badf60da2b612cb34ec6629f07f91516b2de325))
* add specification for state persistence and sharing feature ([78f147e](https://github.com/johnsyweb/ambassy/commit/78f147e07e3467458bb889f447af5651e66d3df7))
* add table-to-map navigation for prospects ([2014782](https://github.com/johnsyweb/ambassy/commit/2014782ea12bc370468e5d5d55a1e4afe06503c8))
* add utilities for finish history matching and display ([8ed77e3](https://github.com/johnsyweb/ambassy/commit/8ed77e31d7fd9aef54b7e98b744a1208b15af1f8))
* apply ambassador name filter to data tables ([fff3df0](https://github.com/johnsyweb/ambassy/commit/fff3df0f8924d46146b79bc14125264cbd70cdb7))
* apply ambassador name filter to map markers and territories ([daa81a3](https://github.com/johnsyweb/ambassy/commit/daa81a3f02dbddc680d829e11db81f159488ecda))
* **build:** inject app version into footer at build time ([ae7f819](https://github.com/johnsyweb/ambassy/commit/ae7f8195aa043b7a17a62ffe1bbb9dddbd9bc985))
* **build:** update sitemap lastmod to build date ([148c6cc](https://github.com/johnsyweb/ambassy/commit/148c6cc722f9dcb1f76579e4ce12ae9a5272ca01))
* canonicalise allocation event names against events.json ([f54c86d](https://github.com/johnsyweb/ambassy/commit/f54c86d0fe4676b872184a5fac86a70c343e7c50))
* clarify allocation principles in ambassador capacity management spec ([26e991f](https://github.com/johnsyweb/ambassy/commit/26e991f4f5687da7230640a8cbc5d3d9d99e8202))
* color prospective event markers with EA colors and add RA polygons ([2a54c17](https://github.com/johnsyweb/ambassy/commit/2a54c17094968a4eec3a742ce2be5c62ca3aca44))
* complete core data model for prospective events ([65d3baa](https://github.com/johnsyweb/ambassy/commit/65d3baa14cb43a38a1ab8814a2e3bfee085913da))
* complete prospect lifecycle polish and tests ([23b5eea](https://github.com/johnsyweb/ambassy/commit/23b5eeac64b410f324e7053613bf17a8aee0b2db))
* complete prospect lifecycle polish and tests ([75bc1ac](https://github.com/johnsyweb/ambassy/commit/75bc1ac6c5ce14fce87cdcb49defd0cd70ba2398))
* complete tasks breakdown for event issues resolution ([ebd8b1a](https://github.com/johnsyweb/ambassy/commit/ebd8b1a327bfa91885a145d494366f61ce39dec5))
* complete User Story 1 UI integration ([5ccb1a4](https://github.com/johnsyweb/ambassy/commit/5ccb1a45ea15f6fe560725e09cf8d5f3b24229f3))
* consolidate EA table action buttons into Actions column ([cf6e168](https://github.com/johnsyweb/ambassy/commit/cf6e168b7244c4c6284439544d0d824633820c88))
* display coordinates for prospects in Prospects table ([ba7d3ff](https://github.com/johnsyweb/ambassy/commit/ba7d3ffcff387e86728da911d69dbb2fb008b71f))
* enable assigning events to newly onboarded Event Ambassadors ([19f7269](https://github.com/johnsyweb/ambassy/commit/19f72697b50940fc734a012e0f819c7b4131d8f5))
* enforce path alias usage with ESLint rule ([ff353f1](https://github.com/johnsyweb/ambassy/commit/ff353f1d4edbb0bfbd51f273b3ede6af86931a70))
* enhance allocation UI with nearest event display, unified reallocation, and keyboard shortcuts ([b889e88](https://github.com/johnsyweb/ambassy/commit/b889e88575fb5668dabffc3b4a6e7f6b52dd2ca2))
* enhance geocoding with URL metadata extraction ([a860d9f](https://github.com/johnsyweb/ambassy/commit/a860d9fc1ea63bd968129aa8b2815424d0641c7a))
* enhance SEO with robots.txt and improved structured data ([d4011cc](https://github.com/johnsyweb/ambassy/commit/d4011cc5e9e10cf0891897bc20f45f2773b36745))
* enrich event teams with last ambassador visit ([a19b399](https://github.com/johnsyweb/ambassy/commit/a19b39914f7301f0cdfbc4a555617f90af269b1a))
* export profile display name and bridge on tab focus in userscript ([d839042](https://github.com/johnsyweb/ambassy/commit/d8390427882a901a0764826c7d7e51ed173f016b))
* **export:** include prospects and visit histories in state export ([502e637](https://github.com/johnsyweb/ambassy/commit/502e637df72668353bf30862ede697df1781b96b))
* extend data models for ambassador lifecycle ([9041d8b](https://github.com/johnsyweb/ambassy/commit/9041d8b720be0ec95ef0135745ede02bbe97a80f))
* extend event name canonicalisation for common CSV variants ([a0ad17d](https://github.com/johnsyweb/ambassy/commit/a0ad17d9c0cb0f50125ddb2db284748506652009))
* **filter:** match prospects by REA or assigned EA ([a14592d](https://github.com/johnsyweb/ambassy/commit/a14592d8265e6fe656426569c5b743a605b125f1))
* find unallocated parkrun events inside map viewport ([7537605](https://github.com/johnsyweb/ambassy/commit/7537605437e2023acbedfe49be45957aa05426a2))
* generate implementation tasks for state persistence and sharing ([9d541e9](https://github.com/johnsyweb/ambassy/commit/9d541e921c25a53c5f95f6af0c24503ee3b2de92))
* hyperlegible font ([4124315](https://github.com/johnsyweb/ambassy/commit/41243151fec452899a985ec721956e09b802b23c))
* implement address geocoding for event issues resolution ([0d61562](https://github.com/johnsyweb/ambassy/commit/0d61562ef9a2c64ea7cd30195d2b5478a860f94d))
* implement complete reallocation workflow (US3) ([6ee9f6a](https://github.com/johnsyweb/ambassy/commit/6ee9f6a322c9b73c1aced31302e1e2fd8fdc5aa7))
* implement configurable capacity limits (User Story 4) ([cf6f2b8](https://github.com/johnsyweb/ambassy/commit/cf6f2b8939917cb4f8983b6d6e0f9e129034908c))
* implement core table sorting infrastructure (Phase 1) ([3c5d787](https://github.com/johnsyweb/ambassy/commit/3c5d7879ea49b94fee04175a88f3d7e133d1b45a))
* implement EA-to-REA transition (User Story 2) ([c5749a3](https://github.com/johnsyweb/ambassy/commit/c5749a398ba8c5e2e92c65b6403809eef0108db1))
* implement enhanced onboarding with state and REA assignment (User Story 1) ([877b900](https://github.com/johnsyweb/ambassy/commit/877b900888c464f232e8391c8d905c8134f0d094))
* implement event matching UI for prospect launch ([9ad1af1](https://github.com/johnsyweb/ambassy/commit/9ad1af1200749928bb0c3dbcd10366991986b950))
* implement event matching UI for prospect launch ([7ebcc28](https://github.com/johnsyweb/ambassy/commit/7ebcc28ae4cd3964b4ba58960de3a01358e1fcae))
* implement event search dialog UI ([19a1c4e](https://github.com/johnsyweb/ambassy/commit/19a1c4e246ec3297972a46a7ee0bd0f5b625e8a4))
* implement foundational launch/archive actions for prospect lifecycle ([c257be9](https://github.com/johnsyweb/ambassy/commit/c257be946ab2a458c5c878437f76d3055ddf988f))
* implement foundational launch/archive actions for prospect lifecycle ([0c92fb4](https://github.com/johnsyweb/ambassy/commit/0c92fb474cd67449d377e9469ba51dd6e98128c5))
* implement foundational models and User Story 1 onboarding ([9b59310](https://github.com/johnsyweb/ambassy/commit/9b59310d3bf7a31e11c055392083697bc603bbd4))
* implement map event allocation feature ([f10dbb7](https://github.com/johnsyweb/ambassy/commit/f10dbb7c7e861cfe5c37e098654988bde105afaf))
* implement multiple sharing methods (file, URL, clipboard) ([7b85cec](https://github.com/johnsyweb/ambassy/commit/7b85cecdfacda5bd50f43e5c98218e774ba969fc))
* implement prospect reallocation functionality ([4078c5a](https://github.com/johnsyweb/ambassy/commit/4078c5a14330f4b20a72f869c9f79fd82bb165cc))
* implement REA-to-EA transition with EA reallocation (User Story 3) ([83540a8](https://github.com/johnsyweb/ambassy/commit/83540a8e64cbd67f526c1cda9bcfbc7406959806))
* implement reallocation dialog with prioritised suggestions (US2) ([f26f9d7](https://github.com/johnsyweb/ambassy/commit/f26f9d71fce813525575784433821bceebff518e))
* implement resolveIssue functions ([0221681](https://github.com/johnsyweb/ambassy/commit/0221681e27558cd15bd97ab9b723bda418e9bd74))
* implement searchEvents function with fuzzy matching ([ae2839d](https://github.com/johnsyweb/ambassy/commit/ae2839d86bdd3a7b481dcd92ac36976ae1fa78be))
* implement separate logging for each reassignment (FR-036) ([250b4aa](https://github.com/johnsyweb/ambassy/commit/250b4aae9adf186ce7b8cf23071abbf94de56799))
* implement sticky table headers (User Story 2) ([72faada](https://github.com/johnsyweb/ambassy/commit/72faada5937c77ec7657bdbee4e6276e9452c8b8))
* implement tabbed interface for data tables ([90b7bd0](https://github.com/johnsyweb/ambassy/commit/90b7bd08be4b5f2fde1d615f4e927562a1449dfc))
* implement URL suggestion for geocoding metadata extraction ([cc6fc39](https://github.com/johnsyweb/ambassy/commit/cc6fc39051afd3e9269927c60e271a1c3edf79d1))
* implement User Stories 2 and 3 - export and import functionality ([5f6282a](https://github.com/johnsyweb/ambassy/commit/5f6282aa3884894efe453cc85bafc7caa4385ad1))
* implement User Story 1 - automatic state persistence ([ed16041](https://github.com/johnsyweb/ambassy/commit/ed1604160ec2338472a2856dcf776fa1d980a7b1))
* implement User Story 1 - Event Teams ↔ Map Navigation ([1b48c5b](https://github.com/johnsyweb/ambassy/commit/1b48c5bfcd97293ee7b9b0dcd3a739f3a04079c6))
* implement User Story 1 - export button visibility ([a5a9f93](https://github.com/johnsyweb/ambassy/commit/a5a9f9312c2d515e0ca26573e1a1048eecd577c5))
* implement User Story 2 - Capacity Checking and Flagging ([fc9a0fa](https://github.com/johnsyweb/ambassy/commit/fc9a0fa46113434afe8e2e3a5c41587f522e1e2f))
* implement User Story 2 - Map → Event Teams Table Navigation ([7003a9c](https://github.com/johnsyweb/ambassy/commit/7003a9cc3ed93ba81435864cceaa65f94b0a5b7a))
* implement User Story 3 - Offboard Ambassadors with Reallocation ([065230a](https://github.com/johnsyweb/ambassy/commit/065230ab4169f136e0792ef843f4b0824616d75a))
* import and merge ambassador finish history ([a41cb08](https://github.com/johnsyweb/ambassy/commit/a41cb08dc4b3d6bd224447b1cd8bf63deb010078))
* **import:** restore full local state from export files ([c2181c7](https://github.com/johnsyweb/ambassy/commit/c2181c7015466a55008d2ce50bf8630396c4a15f))
* improve SEO/OG tags and add automated screenshot generation ([1531021](https://github.com/johnsyweb/ambassy/commit/153102120593d1a2e6928f6a66eb10fe6be85ae6))
* include prospective events in Event Ambassador allocation counts ([b5f1a2b](https://github.com/johnsyweb/ambassy/commit/b5f1a2bc50b26c6bbc660fdcff0bc34fa66b49e5))
* increase zoom level for single event selection ([8d78671](https://github.com/johnsyweb/ambassy/commit/8d78671c7d3f9e556da80c759b8ee404a588359b))
* integrate change tracking into all state mutations ([dc0f906](https://github.com/johnsyweb/ambassy/commit/dc0f906a8edb22c8489ab7d5191161375bf13d36))
* integrate prospective events into Event Ambassador table display ([b8d0417](https://github.com/johnsyweb/ambassy/commit/b8d04177df3681889fe8a646a5f673493b17f1ef))
* integrate sorting into all tables (User Story 1) ([445ffae](https://github.com/johnsyweb/ambassy/commit/445ffae458233632301d5d86692b34738f3b45df))
* load countries dynamically from parkrun events.json ([81b8409](https://github.com/johnsyweb/ambassy/commit/81b8409cd747d435353590b97dd6be52695316c4))
* match ambassadors by parkrun profile display name ([a01584a](https://github.com/johnsyweb/ambassy/commit/a01584aded1f482c73310bf8d80cfc0f3dd88dc4))
* **models:** add normalised event short name lookups ([a391f92](https://github.com/johnsyweb/ambassy/commit/a391f9275b48ff1163674516afe3aa0af30fd64b))
* move all buttons to header ([952620c](https://github.com/johnsyweb/ambassy/commit/952620c886e05d77ca6c172c3be262b55211f71c)), closes [#ambassy](https://github.com/johnsyweb/ambassy/issues/ambassy)
* move all buttons to header ([e03f0d5](https://github.com/johnsyweb/ambassy/commit/e03f0d57dceaf8eac6fd4751cada5b580f5ffcaf)), closes [#ambassy](https://github.com/johnsyweb/ambassy/issues/ambassy)
* persist ambassador finish histories in local storage ([9baf54e](https://github.com/johnsyweb/ambassy/commit/9baf54e658b184af8a4dfae5f93e32fece30a581))
* persist resolved events to localStorage ([5605e79](https://github.com/johnsyweb/ambassy/commit/5605e7998ec2cd3f079f41ede162c66bc7ef42a8))
* persist resolved issues through export/import ([f11a9ae](https://github.com/johnsyweb/ambassy/commit/f11a9ae7b397635f9af06d9280aa014f87e07858))
* pre-select ambassador in assign import dialog from profile name ([ea0e914](https://github.com/johnsyweb/ambassy/commit/ea0e914c6eed7df425a4af0928fa5f5113f02fea))
* prioritise EA home parkrun in allocation suggestions ([8a61b99](https://github.com/johnsyweb/ambassy/commit/8a61b997fd95ab5983338da8a4fcecc75341df98))
* prioritize ambassadors with fewer allocations and show neighboring events ([695e43c](https://github.com/johnsyweb/ambassy/commit/695e43c3712d97761b5f0eb1871e14eb5ab85714))
* refine prioritization: zero allocations first, then neighboring events ([0ca0d8d](https://github.com/johnsyweb/ambassy/commit/0ca0d8d86ddd70b6adbf53623d4b159f7fa45fc4))
* **release:** add semantic-release and commitlint tooling ([0499534](https://github.com/johnsyweb/ambassy/commit/049953443d459af91836e805a22923868de74d42))
* reorganise GitHub Actions workflows with proper chaining ([37e33cd](https://github.com/johnsyweb/ambassy/commit/37e33cd009f08f949f113a9cad19473dee736570))
* replace prompt() dialogs with clickable suggestion buttons (FR-037) ([55c924b](https://github.com/johnsyweb/ambassy/commit/55c924b5756adb9dc6a9048f4d3e8744b16b5499))
* retain pending finish import until import succeeds ([f279219](https://github.com/johnsyweb/ambassy/commit/f279219582792b594632c29bad64f9aa53d80571))
* show banner when shared state is loaded from link ([a2f2e63](https://github.com/johnsyweb/ambassy/commit/a2f2e635cb780faa78a61f87e49275e4cd856979))
* show distance next to neighboring event names ([3713a36](https://github.com/johnsyweb/ambassy/commit/3713a36ea3a15912d44c39d58f59b7f670e55e71))
* **state:** extend application state schema to 2.0.0 ([a81f933](https://github.com/johnsyweb/ambassy/commit/a81f93352804d53927348e44367264c6fd893c12))
* support multiple recipients for offboarding reallocation ([339c1f0](https://github.com/johnsyweb/ambassy/commit/339c1f00fdcdfbd72b95c694141cd515dc36044a))
* **ui:** add visit history userscript install button ([479a70b](https://github.com/johnsyweb/ambassy/commit/479a70b1c064ff1e947954ad59cd3cd8b748fcb5))
* **ui:** clarify empty last ambassador visit cells in Event Teams table ([2937d7e](https://github.com/johnsyweb/ambassy/commit/2937d7e3a76c9eff88a4a5be82e230225c7dd5fd))
* **ui:** header and footer with parkrun palette and breadcrumbs ([77e64d0](https://github.com/johnsyweb/ambassy/commit/77e64d04890173822aefb8daee92d0fddddf26e2)), closes [#4c1a57](https://github.com/johnsyweb/ambassy/issues/4c1a57)
* **ui:** move visit history pending banner above map and tables ([a217ef1](https://github.com/johnsyweb/ambassy/commit/a217ef12bfbf951108b12cba232abdfdf4a989f7))
* **ui:** replace Share and Open with Export and Import ([4af9ed7](https://github.com/johnsyweb/ambassy/commit/4af9ed7662f48d867fb77c5418a957d5f3004c02))
* update event issues resolution plan for address geocoding ([bb7d65e](https://github.com/johnsyweb/ambassy/commit/bb7d65e7696431594f11a534e7cff3a2f242c649))
* update REA relationships when events are reallocated ([77dfcae](https://github.com/johnsyweb/ambassy/commit/77dfcae1394dbf5c2ebda60a10f21a7362841845))
* update screenshot script to load CSV files from public directory ([c214347](https://github.com/johnsyweb/ambassy/commit/c214347a7b1c882cffd35d50ddd99df361a0f089))
* update tasks for address geocoding instead of pin placement ([d5acb29](https://github.com/johnsyweb/ambassy/commit/d5acb299150ecb2422937005ea65c110bef4a8ae))
* use nearby parkrun events to constrain Voronoi polygons ([716074d](https://github.com/johnsyweb/ambassy/commit/716074da4516d1af4b948864fbbf519bc33267ed))
* **userscript:** use GitHub raw URL for download and update ([2c6e214](https://github.com/johnsyweb/ambassy/commit/2c6e2140bf28c208531d132b30ff033903070c27))
* **utils:** add global spherical Voronoi territory module ([9b01215](https://github.com/johnsyweb/ambassy/commit/9b012159cfa01ab2547b43d50b5ef631874a81bb))
* **visit-history:** distinguish not imported from no visit on record ([5ef5e5f](https://github.com/johnsyweb/ambassy/commit/5ef5e5ffbd4f70ac52757121983f6dc2e80a7d21))
* whitelist CSV columns and expand privacy copy ([edaf38c](https://github.com/johnsyweb/ambassy/commit/edaf38c664650d93bd3fafa5dc218cf78280e01c))
* wire ambassador finish history into the application UI ([7d8bd88](https://github.com/johnsyweb/ambassy/commit/7d8bd8849a4fec99f0fc2b1f817dc1012cca11a7))
* wire up Issues tab in main application ([80a5933](https://github.com/johnsyweb/ambassy/commit/80a5933e97f129fc07e05b9243f3b71afe865d0c))


### Performance Improvements

* **dev:** enable webpack cache and lighter dev source maps ([9c16c56](https://github.com/johnsyweb/ambassy/commit/9c16c5636f1bfc327c97999ae36d49463ad5ed48))
* **events:** cache parsed events catalogue in memory ([d69c9b3](https://github.com/johnsyweb/ambassy/commit/d69c9b3fbf30c6f1bdd48423bdb4c7b63f844152))
* **finish-import:** debounce tab activation handlers ([5708924](https://github.com/johnsyweb/ambassy/commit/5708924f8dac0bcc86eee90d28b282f2b6bad3b9))
* **map:** cull territory polygons to viewport-intersecting rings ([d4bd05d](https://github.com/johnsyweb/ambassy/commit/d4bd05dd0c417b36102789e24ce07ba58079c255))
* **map:** instrument Voronoi recompute with dev-only user timings ([60bf6d9](https://github.com/johnsyweb/ambassy/commit/60bf6d945cbb4c0c6032c074d28f416315671090))
* **map:** render event markers via Leaflet canvas renderer ([6e3b2f8](https://github.com/johnsyweb/ambassy/commit/6e3b2f8cd3459364c5a7deb9d90eb44253fcf662))
* **map:** skip populateMap when population fingerprint unchanged ([f28cf1b](https://github.com/johnsyweb/ambassy/commit/f28cf1bbf663d6c8d6defb8e4610fe7946556ca9))
* render map markers only for allocated events and prospects ([bde296b](https://github.com/johnsyweb/ambassy/commit/bde296b4191b36b2bfaa2c1281c48312b0526fe2))
* show viewport-culled unallocated markers for map allocation ([50b2668](https://github.com/johnsyweb/ambassy/commit/50b26683aeed84be1e24b288feabd717f8213b90))
* speed up session-load event name canonicalisation ([69509b0](https://github.com/johnsyweb/ambassy/commit/69509b0bd4f6460cce5c336a15a4e6b04f6fa737))
* **ui:** skip map rebuild for metadata-only refresh paths ([2d63819](https://github.com/johnsyweb/ambassy/commit/2d63819e1c750fe9c1cf2d2e5faa243a01244c27))


### Reverts

* **007:** use distance to nearest live or prospect event as tiebreaker ([a67db6e](https://github.com/johnsyweb/ambassy/commit/a67db6e88ef3c5f4397c7a2d15c11618f1c560f9))
* remove country filtering, keep geographic bounds only ([7a1ec8b](https://github.com/johnsyweb/ambassy/commit/7a1ec8bdb9d79bf91c70a3680b0c0dc043d54f5e))


### BREAKING CHANGES

* **constitution:** Constitution v1.4.0 prohibits commented-out code

Key changes:
- Added explicit prohibition on commented-out code in Quality Gates
- Added Code Cleanliness Requirements section
- Added prohibition rationale in Single Responsibility principle
- Added removal step to Pre-Commit Checklist
- Added removal requirement to Code Review Requirements

Rationale: Commented-out code is a liability because:
1. It becomes outdated and misleading
2. It clutters the codebase
3. It suggests uncertainty about what should exist
4. Version control (git) is the proper place for code history

If code needs to be preserved for reference, use git history, not comments.
* **constitution:** Constitution v1.3.0 adds strict linting enforcement

Key changes:
- Require fixing ALL lint errors in modified files, even if pre-existing
- Require zero lint errors/warnings at all times
- Make Pre-Commit Checklist mandatory (not optional)
- Require CI to pass before merge (explicitly blocks on failures)
- Add CI enforcement requirements
- Recommend pre-commit hooks for automated enforcement

Rationale: We accumulated 49 lint errors because:
1. No automated pre-commit enforcement
2. CI runs AFTER code is committed (too late)
3. No requirement to fix existing errors in modified files
4. Checklists were aspirational, not enforced

This update prevents technical debt accumulation by:
- Making lint error fixing mandatory when touching files
- Requiring CI to pass before merge
- Making checklists mandatory, not optional
- Adding explicit CI enforcement requirements

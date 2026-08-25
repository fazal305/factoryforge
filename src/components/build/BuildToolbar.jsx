import { BUILD_CATEGORY, BUILD_CATEGORY_LABEL, buildingsByCategory } from '../../data/buildings'
import { useUiStore } from '../../state/uiStore'
import Tooltip from '../common/Tooltip'
import './BuildToolbar.css'

const CATEGORY_ICON = {
  [BUILD_CATEGORY.MINING]: '⛏',
  [BUILD_CATEGORY.LOGISTICS]: '➤',
  [BUILD_CATEGORY.PRODUCTION]: '⚙',
  [BUILD_CATEGORY.POWER]: '⚡',
  [BUILD_CATEGORY.STORAGE]: '▢',
}

const CATEGORIES = Object.values(BUILD_CATEGORY)

/**
 * Bottom build toolbar. Selecting a category expands a flyout of its
 * buildings; selecting a building arms placement mode (consumed by the
 * renderer/input controller in a later step).
 */
export default function BuildToolbar() {
  const activeBuildCategory = useUiStore((s) => s.activeBuildCategory)
  const selectedBuildingId = useUiStore((s) => s.selectedBuildingId)
  const setActiveBuildCategory = useUiStore((s) => s.setActiveBuildCategory)
  const selectBuildingForPlacement = useUiStore((s) => s.selectBuildingForPlacement)
  const cancelBuildMode = useUiStore((s) => s.cancelBuildMode)

  return (
    <div className="ff-build-toolbar">
      {activeBuildCategory && (
        <div className="ff-build-flyout" role="menu" aria-label={BUILD_CATEGORY_LABEL[activeBuildCategory]}>
          {buildingsByCategory(activeBuildCategory).map((building) => (
            <button
              key={building.id}
              type="button"
              role="menuitem"
              className={`ff-build-flyout__item${selectedBuildingId === building.id ? ' ff-build-flyout__item--active' : ''}`}
              onClick={() => selectBuildingForPlacement(building.id)}
              title={building.description}
            >
              <span className="ff-build-flyout__name">{building.name}</span>
              <span className="ff-build-flyout__cost">
                {Object.entries(building.cost)
                  .map(([resId, qty]) => `${qty} ${resId}`)
                  .join(' · ')}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="ff-build-toolbar__categories" role="tablist" aria-label="Build categories">
        {CATEGORIES.map((category) => (
          <Tooltip key={category} label={BUILD_CATEGORY_LABEL[category]}>
            <button
              type="button"
              role="tab"
              aria-selected={activeBuildCategory === category}
              className={`ff-build-toolbar__cat${activeBuildCategory === category ? ' ff-build-toolbar__cat--active' : ''}`}
              onClick={() => setActiveBuildCategory(category)}
            >
              <span aria-hidden="true">{CATEGORY_ICON[category]}</span>
              <span className="ff-build-toolbar__cat-label">{BUILD_CATEGORY_LABEL[category]}</span>
            </button>
          </Tooltip>
        ))}

        {selectedBuildingId && (
          <button type="button" className="ff-build-toolbar__cancel" onClick={cancelBuildMode}>
            Cancel (Esc)
          </button>
        )}
      </div>
    </div>
  )
}

import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Input, Placeholder, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '@unlock-protocol/ui'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SettingCardDetail } from '../elements/SettingCard'
import { ethers } from 'ethers'
import { useProvider } from '~/hooks/useProvider'

interface CancellationFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  freeTrialLength: number
  refundPenaltyPercentage: number
}

const CancellationFormPlaceholder = () => {
  const FormPlaceholder = () => {
    return (
      <Placeholder.Root spaced="sm">
        <Placeholder.Line size="sm" width="sm" />
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" width="md" />
        <Placeholder.Root inline className="justify-between">
          <Placeholder.Line size="sm" width="sm" />
          <Placeholder.Line size="sm" width="sm" />
        </Placeholder.Root>
      </Placeholder.Root>
    )
  }
  return (
    <div className="flex flex-col gap-12">
      <FormPlaceholder />
      <FormPlaceholder />
    </div>
  )
}

export const CancellationForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: CancellationFormProps) => {
  const [allowTrial, setAllowTrial] = useState(false)
  const [cancelPenalty, setCancelPenalty] = useState(false)
  const web3Service = useWeb3Service()
  const { getWalletService } = useProvider()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormProps>()

  const updateRefundPenalty = async ({
    freeTrialLength = 0,
    refundPenaltyPercentage = 0,
  }: FormProps) => {
    const refundPenaltyBasisPoints = refundPenaltyPercentage * 100 // convert to basis points
    const walletService = await getWalletService(network)
    await walletService.updateRefundPenalty({
      lockAddress,
      freeTrialLength,
      refundPenaltyBasisPoints,
    })
  }

  const updateRefundPenaltyMutation = useMutation({
    mutationFn: updateRefundPenalty,
  })

  const onUpdateRefundPenalty = async (fields: FormProps) => {
    if (isValid) {
      const updateRefundPenaltyPromise =
        updateRefundPenaltyMutation.mutateAsync(fields)

      await ToastHelper.promise(updateRefundPenaltyPromise, {
        loading: 'Updating the refund policy.',
        success: 'Penalty policy updated!',
        error:
          'There was an issue updating the refund policy. Please try again.',
      })
    } else {
      ToastHelper.error('Form is not valid.')
    }
  }

  const getFreeTrialLength = async () => {
    return await web3Service.freeTrialLength({
      lockAddress,
      network,
    })
  }

  const getRefundPenaltyBasisPoints = async () => {
    return await web3Service.refundPenaltyBasisPoints({
      lockAddress,
      network,
    })
  }

  const [
    {
      isLoading: isLoadingFreeTrial,
      data: freeTrialLength = 0,
      error: freeTrialError,
    },
    {
      isLoading: isLoadingPenalty,
      data: refundPenaltyBasisPoints = 0,
      error: penaltyError,
    },
  ] = useQueries({
    queries: [
      {
        queryFn: getFreeTrialLength,
        queryKey: [
          'getFreeTrialLength',
          lockAddress,
          network,
          updateRefundPenaltyMutation.isSuccess,
        ],
      },
      {
        queryFn: getRefundPenaltyBasisPoints,
        queryKey: [
          'refundPenaltyBasisPoints',
          lockAddress,
          network,
          updateRefundPenaltyMutation.isSuccess,
        ],
      },
    ],
  })

  useEffect(() => {
    if (freeTrialError) {
      ToastHelper.error('Impossible to retrieve freeTrialLength value.')
    }
  }, [freeTrialError])

  useEffect(() => {
    if (penaltyError) {
      ToastHelper.error(
        'Impossible to retrieve refundPenaltyBasisPoints value.'
      )
    }
  }, [penaltyError])

  useEffect(() => {
    const allowTrial = freeTrialLength > 0

    setAllowTrial(freeTrialLength > 0)
    setValue(
      'freeTrialLength',
      allowTrial ? (Number(freeTrialLength) ?? 0) : 0,
      {
        shouldValidate: true,
      }
    )
  }, [freeTrialLength])

  useEffect(() => {
    const cancelPenalty = refundPenaltyBasisPoints > 0
    const refundPenaltyPercentage =
      ethers.toNumber(refundPenaltyBasisPoints ?? 0) / 100 // convert basis points to percentage
    setCancelPenalty(cancelPenalty)

    setValue(
      'refundPenaltyPercentage',
      cancelPenalty ? refundPenaltyPercentage : 0,
      {
        shouldValidate: true,
      }
    )
  }, [refundPenaltyBasisPoints])

  const isLoading = isLoadingPenalty || isLoadingFreeTrial

  const disabledInput = updateRefundPenaltyMutation.isPending || disabled

  if (isLoading) return <CancellationFormPlaceholder />

  return (
    <form
      className="flex flex-col gap-12"
      onSubmit={handleSubmit(onUpdateRefundPenalty)}
    >
      <div className="flex flex-col gap-6">
        <SettingCardDetail
          title="Allow Trial"
          description="If you enable a free trial period, users will be able to get a full refund when they cancel their memberships. It is strongly advised to add transfer penalties when enabling free trials to avoid risks of people stealing funds from your contract."
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-base">Free trial duration (in days)</span>
            <ToggleSwitch
              disabled={disabledInput}
              enabled={allowTrial}
              setEnabled={setAllowTrial}
            />
          </div>

          <Input
            type="number"
            disabled={disabledInput || !allowTrial}
            step={1}
            error={errors?.freeTrialLength && 'This field is required'}
            {...register('freeTrialLength', {
              valueAsNumber: true,
              required: true,
              min: 0,
            })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <SettingCardDetail
          title="Cancel Penalty"
          description="Enable this feature if you wish to apply a cancellation penalty. The penalty is a percentage of the membership cost. The refund amount is pro-rated after the penalty has been applied. If you select 100%, the users will not receive any refund."
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-base">Penalty fee</span>
            <ToggleSwitch
              disabled={disabledInput}
              enabled={cancelPenalty}
              setEnabled={setCancelPenalty}
            />
          </div>
          <Input
            type="number"
            disabled={disabledInput || !cancelPenalty}
            step={1}
            error={
              errors?.refundPenaltyPercentage &&
              'This field accepts percentage values between 0 and 100.'
            }
            {...register('refundPenaltyPercentage', {
              valueAsNumber: true,
              required: true,
              min: 0,
              max: 100,
            })}
          />
        </div>
      </div>
      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          loading={updateRefundPenaltyMutation.isPending}
          disabled={disabledInput}
        >
          Apply
        </Button>
      )}
    </form>
  )
}
